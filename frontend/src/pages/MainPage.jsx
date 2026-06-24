import { useState, useEffect } from 'react';
import { getMembers, getConfirmedDate, resetConfirmedDate } from '../api/api';
import '../styles/global.css';
import styles from '../styles/MainPage.module.css';

function MainPage({ navigate, tableInfo }) {
    const [members, setMembers] = useState([]);
    const [confirmedDate, setConfirmedDate] = useState(null);

    const savedCount = members.filter(m => m.hasSaved).length;

    // 멤버가 없거나 날짜를 선택하지 않은 멤버가 있으면 비활성화
    const isButtonDisabled = members.length === 0;

    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
        getConfirmedDate()
            .then(res => setConfirmedDate(res.data.confirmedDate))
            .catch(() => setConfirmedDate(null)); // 확정 전이면 null
    }, []);

    // members 배열에서 host 찾기
    const hostMember = members.find(m => m.isHost);

    // 날짜 포맷 변환 (2026-05-23 → 2026. 05. 23 (토))
    const formatDate = (dateStr, includeDay = false) => {
        if (!dateStr) return '???';

        const date = new Date(dateStr + 'T00:00:00');

        if (isNaN(date.getTime())) return '???';

        const days = ['일', '월', '화', '수', '목', '금', '토'];

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (includeDay) {
            return `${year}. ${month}. ${day} (${days[date.getDay()]})`;
        }

        return `${year}-${month}-${day}`;
    };

    const handleProfileClick = (member) => {
        localStorage.setItem('memberId', member.memberId);
        localStorage.setItem('isHost', String(member.isHost));
        navigate('calendar');
    };

    // 프로필 추가 버튼에 모달 추가
    const [showResetModal, setShowResetModal] = useState(false);

    const handleProfileAddClick = () => {
        if (confirmedDate) {
            setShowResetModal(true);
        } else {
            navigate('profileCreate');
        }
    };

    const handleResetConfirm = async () => {
        await resetConfirmedDate();
        setShowResetModal(false);
        navigate('profileCreate');
    };

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
                        <span className="info-label">SAVED</span>
                        <span className="info-value">{savedCount}</span>
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
                    {/* 확정 날짜 배너 */}
                    {confirmedDate && (
                        <div className={styles['confirmed-banner']}
                        onClick={() => navigate('result')}
                        style={{ cursor: 'pointer' }}
                        >
                            <span className={styles['confirmed-label']}>확정 날짜</span>
                            <span className={styles['confirmed-date']}>{formatDate(confirmedDate, true)}</span>
                        </div>
                    )}

                    <p className={styles['section-label']}>프로필 선택</p>

                    <div className={styles['profile-list']}>
                        {members.map(member => (
                            <div
                                key={member.memberId}
                                onClick={() => handleProfileClick(member)}
                                className={styles['profile-item']}
                            >
                                <div
                                    className={styles['profile-square']}
                                    style={{ backgroundColor: member.profileColor }}
                                />
                                <span className={styles['profile-name']}>{member.name}</span>
                            </div>
                        ))}

                        <div
                            onClick={handleProfileAddClick}
                            className={styles['profile-item']}
                        >
                            <div className={styles['profile-add-btn']}>+</div>
                            <span className={styles['profile-add-label']}>프로필 추가</span> 
                        </div>
                    </div>

                    <button
                        className={styles['date-btn']}
                        onClick={() => navigate('confirm')}
                        disabled={isButtonDisabled}
                        style={{ 
                            cursor: isButtonDisabled ? 'default' : 'pointer',
                            opacity: isButtonDisabled ? 0.5 : 1
                        }}
                    >
                        날짜 후보 보기
                    </button>
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
                        <span className="info-label">SAVED</span>
                        <span className="info-value">{savedCount}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">HOST</span>
                        <span className={`info-value ${hostMember?.name ? 'host-name' : 'host-empty'}`}>
                            {hostMember?.name ?? '???'}
                        </span>
                    </div>
                </div>

                {/* 모달 */}
                {showResetModal && (
                    <div className={styles['modal-overlay']}>
                        <div className={styles['modal']}>
                            <p>멤버를 추가하면 확정된 날짜가 초기화됩니다. 계속하시겠어요?</p>
                            <div className={styles['modal-buttons']}>
                                <button onClick={() => setShowResetModal(false)} className={styles['btn']}>취소</button>
                                <button onClick={handleResetConfirm} className={styles['btn']}>추가하기</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default MainPage;
