import { useState, useEffect } from 'react';
import { getMembers, getConfirmedDate } from '../api/api';
import '../styles/global.css';
import styles from '../styles/ResultPage.module.css';
import overlayImage from '../assets/LetsGo.png';

function ResultPage({ navigate }) {
    const [members, setMembers] = useState([]);
    const [confirmedDate, setConfirmedDate] = useState(null);

    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
        getConfirmedDate()
            .then(res => {
                if (res.data) {
                    setConfirmedDate(new Date(res.data.confirmedDate + 'T00:00:00'));
                }
            })
            .catch(() => setConfirmedDate(null));
    }, []);

    const hostMember = members.find(m => m.isHost);

    const formatDate = (date) => {
        if (!date) return '???';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
                        <span className="info-value">
                            {confirmedDate ? formatDate(confirmedDate) : '???'}
                        </span>
                    </div>
                </div>

                {/* 영수증 콘텐츠 */}
                <div
                    className={styles['receipt-content']}
                    onClick={() => navigate('main')}
                    style={{ cursor: 'pointer' }}
                >
                    {/* 위에 올릴 이미지 */}
                    <div className={styles['overlay-image']}>
                        <img
                            src={overlayImage}
                            alt="overlay"
                        />
                    </div>

                    {/* 영수증 테이블 */}
                    <div className={styles['receipt-table']}>

                        {/* 멤버 행 */}
                        {members.map((member, index) => (
                            <div key={member.memberId} className={styles['receipt-row']}>
                                <div className={styles['row-index']}></div>
                                <div className={styles['row-name']}>{member.name}</div>
                                <div className={styles['row-empty']} />
                                <div className={styles['row-empty']} />
                            </div>
                        ))}

                        {/* 빈 행 채우기 */}
                        {Array.from({ length: Math.max(0, 12 - members.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className={styles['receipt-row']}>
                                <div className={styles['row-index']} />
                                <div className={styles['row-name']} />
                                <div className={styles['row-empty']} />
                                <div className={styles['row-empty']} />
                            </div>
                        ))}

                        {/* TAX 행 */}
                        <div className={styles['receipt-row']}>
                            <div className={styles['row-index']} />
                            <div className={`${styles['row-name']} ${styles['row-label']}`}>TAX</div>
                            <div className={styles['row-empty']} />
                            <div className={styles['row-empty']} />
                        </div>

                        {/* TOTAL 행 */}
                        <div className={styles['receipt-row']}>
                            <div className={styles['row-index']} />
                            <div className={`${styles['row-name']} ${styles['row-label']}`}>TOTAL</div>
                            <div className={styles['row-empty']} />
                            <div className={styles['row-empty']} />
                        </div>

                        {/* 빈 행 */}
                        <div className={styles['receipt-row']}>
                            <div className={styles['row-index']} />
                            <div className={styles['row-name']} />
                            <div className={styles['row-empty']} />
                            <div className={styles['row-empty']} />
                        </div>

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
                        <span className={`info-value ${hostMember?.name ? 'host-name' : 'host-empty'}`}>
                            {hostMember?.name ?? '???'}
                        </span>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default ResultPage;
