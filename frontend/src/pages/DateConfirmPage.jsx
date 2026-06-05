import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getMembers, getDates, confirmDate, getConfirmedDate } from '../api/api';
import '../styles/global.css';
import styles from '../styles/DateConfirmPage.module.css';

function DateConfirmPage({ navigate }) {
    const [members, setMembers] = useState([]);
    const [memberDates, setMemberDates] = useState({});
    const [commonDates, setCommonDates] = useState([]);
    const [confirmedDate, setConfirmedDate] = useState(null);
    const [activeStartDate, setActiveStartDate] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const memberId = localStorage.getItem('memberId');
    const today = new Date();

    const isCurrentMonth =
        activeStartDate.getFullYear() === today.getFullYear() &&
        activeStartDate.getMonth() === today.getMonth();

    const hostMember = members.find(m => m.isHost);

    const allMembersSelected = members.length > 0 &&
        Object.values(memberDates).every(m => m.dates.length > 0);
        

    // 멤버 목록 조회
    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
    }, []);


    // 모든 멤버 날짜 조회
    useEffect(() => {
        if (members.length === 0) return;
        Promise.all(
            members.map(m =>
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
            setMemberDates(map);

            if (results.every(r => r.dates.length > 0)) {
                const firstDates = results[0].dates;
                const common = firstDates.filter(d =>
                    results.every(r =>
                        r.dates.some(rd => rd.toDateString() === d.toDateString())
                    )
                );
                setCommonDates(common);
            }
        });
    }, [members]);

    // 날짜 클릭 (가능한 날짜만 선택)
    const handleDateClick = (date) => {
        const isCommon = commonDates.some(
            d => d.toDateString() === date.toDateString()
        );
        if (!isCommon) return;
        setConfirmedDate(date);
    };

    // 확정 API 호출
    const handleConfirm = async () => {
        if (!confirmedDate) return;
        try {
            const year = confirmedDate.getFullYear();
            const month = String(confirmedDate.getMonth() + 1).padStart(2, '0');
            const day = String(confirmedDate.getDate()).padStart(2, '0');
            await confirmDate(memberId, `${year}-${month}-${day}`);
            navigate('main');
        } catch (e) {
        }
    };

    // 날짜 타일 콘텐츠 (멤버별 점 표시)
    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        const dots = Object.values(memberDates).filter(m =>
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

    // 날짜 타일 클래스
    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return '';
        const isSelected = confirmedDate?.toDateString() === date.toDateString();
        const isExisting = existingConfirmedDate?.toDateString() === date.toDateString();
        const isCommon = commonDates.some(
            d => d.toDateString() === date.toDateString()
        );
        if (isSelected && isExisting) return styles['selected-existing-date'];
        if (isSelected) return styles['selected-date'];
        if (isExisting) return styles['existing-confirmed-date'];
        if (isCommon) return styles['common-date'];
        return '';
    };

    // 가능한 날짜 외 비활성화
    const tileDisabled = ({ date, view }) => {
        if (view !== 'month') return false;
        return !commonDates.some(
            d => d.toDateString() === date.toDateString()
        );
    };

    const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) return '???';

        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayOfWeek = days[date.getDay()];
        return `${year}-${month}-${day}`;
    };

    // 기존 확정 날짜 state 추가
    const [existingConfirmedDate, setExistingConfirmedDate] = useState(null);

    // 기존 확정 날짜 조회
    useEffect(() => {
        getConfirmedDate()
            .then(res => {
            const dateStr = res.data?.confirmedDate;

            if (!dateStr) {
                setExistingConfirmedDate(null);
                return;
            }

            const date = new Date(`${dateStr}T00:00:00`);

            if (isNaN(date.getTime())) {
                setExistingConfirmedDate(null);
                return;
            }

            setExistingConfirmedDate(date);
        })
        .catch(() => setExistingConfirmedDate(null));
    }, []);

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
                            {existingConfirmedDate ? formatDate(existingConfirmedDate) : '???'}
                        </span>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className={styles['main-content']}>

                    {/* 타이틀 */}
                    <div className={styles['title-section']}>
                        <h2 className={styles['title']}>모두 가능한 날짜</h2>
                        <p className={styles['subtitle']}>
                            {commonDates.length > 0
                                ? `${commonDates.length}개의 가능한 날짜가 있어요!`
                                : '아직 모두 가능한 날짜가 없어요!'}
                        </p>
                    </div>


                    {/* 캘린더 */}
                    <div className={styles['calendar-wrapper']}>
                        <Calendar
                            onClickDay={handleDateClick}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            tileDisabled={tileDisabled}
                            calendarType="gregory"
                            activeStartDate={activeStartDate}
                            onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                            showNeighboringMonth={false}
                            formatDay={(locale, date) => date.getDate()}
                            prevLabel={
                                <span style={{
                                    color: isCurrentMonth ? '#d0d4e8' : '#4C60C3',
                                    pointerEvents: isCurrentMonth ? 'none' : 'auto',
                                    fontFamily: "Noto Sans",
                                    fontSize: 24,
                                    marginTop: -5
                                }}>‹</span>
                            }
                        />

                        {/* 멤버 범례 */}
                        <div className={styles['legend-row']}>
                            {members.map(m => (
                                <div key={m.memberId} className={styles['legend-item']}>
                                    <span
                                        className={styles['legend-dot']}
                                        style={{ backgroundColor: m.profileColor }}
                                    />
                                    <span className={styles['legend-name']}>{m.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className={styles['button-row']}>
                        <button
                            className={styles['btn']}
                            disabled={!confirmedDate}
                            onClick={handleConfirm}
                        >
                            확정
                        </button>
                        <button
                            className={styles['btn']}
                            onClick={() => navigate('main')}
                        >
                            뒤로
                        </button>
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

export default DateConfirmPage;
