import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getMembers, getDates, saveDates, getConfirmedDate } from '../api/api';
import '../styles/global.css';
import styles from '../styles/CalendarPage.module.css';

function CalendarPage({ navigate }) {
    const [members, setMembers] = useState([]);
    const [confirmedDate, setConfirmedDate] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);
    const [otherMemberDates, setOtherMemberDates] = useState({});
    const [error, setError] = useState('');
    const [selectAllMap, setSelectAllMap] = useState({});

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [activeStartDate, setActiveStartDate] = useState(firstDayOfMonth); // ← 위로 이동

    const currentMonthKey = `${activeStartDate.getFullYear()}-${activeStartDate.getMonth()}`;
    const selectAll = selectAllMap[currentMonthKey] ?? false; // ← activeStartDate 아래에 위치

    const memberId = localStorage.getItem('memberId');
    const currentMember = members.find(m => String(m.memberId) === String(memberId));
    const hostMember = members.find(m => m.isHost);

    // 현재 보이는 달이 오늘 달인지 확인
    const isCurrentMonth =
        activeStartDate.getFullYear() === today.getFullYear() &&
        activeStartDate.getMonth() === today.getMonth();

    // 멤버 목록 + 확정 날짜 조회
    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
        getConfirmedDate()
            .then(res => setConfirmedDate(res.data.confirmedDate))
            .catch(() => setConfirmedDate(null)); // 확정 전이면 null
    }, []);

     // 날짜 포맷 변환 (2026-05-23 → 2026. 05. 23 (토))
    const formatDate = (dateStr) => {
        if (!dateStr) return '???';
        const date = new Date(dateStr + 'T00:00:00');
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayOfWeek = days[date.getDay()];
        return `${year}-${month}-${day}`;
    };

    // 내 선택 날짜 조회
    useEffect(() => {
        if (!memberId) return;
        getDates(memberId)
            .then(res => {
                const dates = res.data.map(d => new Date(d.date + 'T00:00:00'));
                setSelectedDates(dates);
            })
            .catch(() => setSelectedDates([]));
    }, [memberId]);

    // 다른 멤버들의 선택 날짜 조회
    useEffect(() => {
        if (members.length === 0) return;
        const others = members.filter(m => String(m.memberId) !== String(memberId));
        Promise.all(
            others.map(m =>
                getDates(m.memberId)
                    .then(res => ({
                        memberId: m.memberId,
                        name: m.name,
                        color: m.profileColor,
                        dates: res.data.map(d => new Date(d.date + 'T00:00:00'))
                    }))
                    .catch(() => ({
                        memberId: m.memberId,
                        name: m.name,
                        color: m.profileColor,
                        dates: []
                    }))
            )
        ).then(results => {
            const map = {};
            results.forEach(r => { map[r.memberId] = r; });
            setOtherMemberDates(map);
        });
    }, [members]);

    const handleDateClick = (date) => {
        const isSelected = selectedDates.some(
            d => d.toDateString() === date.toDateString()
        );
        if (isSelected) {
            setSelectedDates(selectedDates.filter(
                d => d.toDateString() !== date.toDateString()
            ));
        } else {
            setSelectedDates([...selectedDates, date]);
        }
        // setSelectAll(false);
        setSelectAllMap({ ...selectAllMap, [currentMonthKey]: false });
    };

    const handleSelectAll = () => {
        const year = activeStartDate.getFullYear();
        const month = activeStartDate.getMonth();

        if (selectAll) {
            // 현재 달 날짜만 제거
            setSelectedDates(selectedDates.filter(
                d => !(d.getFullYear() === year && d.getMonth() === month)
            ));
            setSelectAllMap({ ...selectAllMap, [currentMonthKey]: false });
        } else {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const allDates = [];
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                if (date >= todayStart) allDates.push(date); // ← today 대신 todayStart
            }
            // 다른 달 선택 유지 + 현재 달 추가
            const otherMonthDates = selectedDates.filter(
                d => !(d.getFullYear() === year && d.getMonth() === month)
            );
            setSelectedDates([...otherMonthDates, ...allDates]);
            setSelectAllMap({ ...selectAllMap, [currentMonthKey]: true });
        }
    };

    const handleSave = async () => {
        /*
        if (selectedDates.length === 0) {
            setError('날짜를 하나 이상 선택해주세요');
            return;
        }
        */
        try {
            const dates = selectedDates.map(d => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            });
            await saveDates(memberId, dates);
            navigate('main');
        } catch (e) {
            setError(e.response?.data?.message || '오류가 발생했습니다');
        }
    };

    // 날짜 타일 클래스
    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return '';
        const isSelected = selectedDates.some(
            d => d.toDateString() === date.toDateString()
        );
        return isSelected ? styles['selected-date'] : '';
    };

    // 날짜 타일 콘텐츠 (다른 멤버 점 표시)
    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        const dots = Object.values(otherMemberDates).filter(m =>
            m.dates.some(d => d.toDateString() === date.toDateString())
        );
        if (dots.length === 0) return null;
        return (
            <div className={styles['dot-container']}>
                {dots.map(m => (
                    <span
                        key={m.memberId}
                        className={styles['dot']}
                        style={{ backgroundColor: m.color }}
                    />
                ))}
            </div>
        );
    };

    // 다른 멤버 범례 (날짜 선택한 멤버만)
    const legend = Object.values(otherMemberDates).filter(m => m.dates.length > 0);

    return (
         <div className="page-wrapper">
            
            <div className="card-container">
                <h1 className="main-title">Jababoja</h1>

                {/* 상단 정보 바 */}
                <div className="info-bar">
                    <div className="info-cell">
                        <span className="info-label">TABLE</span>
                        <span className="info-value">1</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">PERSONS</span>
                        <span className="info-value">{members.length}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">SERVER</span>
                        <span className="info-value">7</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">DATE</span>
                        <span className="info-value">
                            {confirmedDate ? formatDate(confirmedDate) : '???'}
                        </span>
                    </div>
                </div>

                
                {/* 메인 콘텐츠 */}
                <div className={styles['main-content']}>

                    {/* 현재 멤버 프로필 헤더 */}
                    {currentMember && (
                        <div className={styles['profile-header']}>
                            <div
                                className={styles['profile-square']}
                                style={{ backgroundColor: currentMember.profileColor }}
                            />
                            <span className={styles['profile-name']}>{currentMember.name}</span>
                        </div>
                    )}

                    {/* 캘린더 */}
                    <div
                        className={styles['calendar-wrapper']}
                        style={{ '--profile-color': currentMember?.profileColor ?? '#f7e7c3' }}
                    >
                        <Calendar
                            onClickDay={handleDateClick}
                            tileClassName={tileClassName}
                            tileContent={tileContent}
                            minDate={today}
                            calendarType="gregory"
                            activeStartDate={activeStartDate}
                            onActiveStartDateChange={({ activeStartDate }) => {
                                setActiveStartDate(activeStartDate);
                            }}
                            showNeighboringMonth={false}
                            formatDay={(locale, date) => date.getDate()}
                            prevLabel={
                                <span style={{
                                    color: isCurrentMonth ? '#D0D4E8' : '#4C60C3',
                                    pointerEvents: isCurrentMonth ? 'none' : 'auto',
                                    fontFamily: "Noto Sans",
                                    fontSize: 24,
                                    marginTop: -5
                                }}>‹</span>
                            }
                        />

                        {/* 모두 선택 + 범례 */}
                        <div className={styles['legend-row']}>
                            <label className={styles['select-all']}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className={styles['checkbox']}
                                />
                                <span>모두 선택</span>
                            </label>
                            
                            {/* 전체 멤버 색상 + 이름 */}
                            <div className={styles['legend-members']}>
                                {members
                                    .filter(m => String(m.memberId) !== String(memberId))
                                    .map(m => (
                                        <div key={m.memberId} className={styles['legend-item']}>
                                            <span
                                                className={styles['legend-dot']}
                                                style={{ backgroundColor: m.profileColor }}
                                            />
                                            <span className={styles['legend-name']}>{m.name}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    {error && <p className={styles['error-text']}>{error}</p>}

                    {/* 버튼 */}
                    <div className={styles['button-row']}>
                        <button onClick={handleSave} className={styles['btn']}>저장</button>
                        <button onClick={() => navigate('main')} className={styles['btn']}>뒤로</button>
                    </div>
                </div>

                {/* 하단 정보 바 */}
                <div className="info-bar">
                    <div className="info-cell">
                        <span className="info-label">TABLE</span>
                        <span className="info-value">My</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">PERSONS</span>
                        <span className="info-value">{members.length}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">SERVER</span>
                        <span className="info-value">7</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">HOST</span>
                        <span className="info-value host-name">{hostMember?.name ?? '???'}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CalendarPage;
