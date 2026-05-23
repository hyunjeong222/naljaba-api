import { useState, useEffect } from 'react';
import { getMembers } from '../api/api';
import '../styles/global.css';
import styles from '../styles/MainPage.module.css';

function MainPage({ navigate, tableInfo }) {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
    }, []);

    // members 배열에서 host 찾기
    const hostMember = members.find(m => m.isHost);

    const handleProfileClick = (member) => {
        localStorage.setItem('memberId', member.memberId);
        localStorage.setItem('isHost', String(member.isHost));
        navigate('calendar');
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
                        <span className="info-label">SERVER</span>
                        <span className="info-value">7</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">DATE</span>
                        <span className="info-value">???</span>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className={styles['main-content']}>
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
                            onClick={() => navigate('profileCreate')}
                            className={styles['profile-item']}
                        >
                            <div className={styles['profile-add-btn']}>+</div>
                            <span className={styles['profile-add-label']}>프로필 추가</span> 
                        </div>
                    </div>

                    <button className={styles['date-btn']} onClick={() => navigate('calendar')}>
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
                        <span className="info-label">SERVER</span>
                        <span className="info-value">7</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">HOST</span>
                        <span className="info-value">{hostMember?.name ?? '???'}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MainPage;
