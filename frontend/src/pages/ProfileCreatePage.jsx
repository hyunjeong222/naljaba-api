import { useState, useEffect } from 'react';
import { createMember, getMembers } from '../api/api';
import '../styles/global.css';
import styles from '../styles/ProfileCreatePage.module.css';

const COLOR_PALETTE = ['#F2E5E9', '#F7E7C3', '#DCD1E0', '#DFDFE9', '#CDE2D6'];

function ProfileCreatePage({ navigate }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [members, setMembers] = useState([]);
    const [assignedColor] = useState(
        () => COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    );

    useEffect(() => {
        getMembers().then(res => setMembers(res.data));
    }, []);

    const hostMember = members.find(m => m.isHost);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('이름을 입력해주세요');
            return;
        }
        try {
            const res = await createMember(name, assignedColor);
            localStorage.setItem('memberId', res.data.memberId);
            localStorage.setItem('isHost', String(res.data.isHost));
            navigate('main');
        } catch (e) {
            setError(e.response?.data?.message || '오류가 발생했습니다');
        }
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
                    <p className={styles['section-label']}>프로필 추가</p>

                    {/* 색상 미리보기 */}
                    <div
                        className={styles['profile-color-preview']}
                        style={{ backgroundColor: assignedColor }}
                    />

                    <div className={styles['profile-input-container']}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="최대 5글자"
                            maxLength={5}
                            className={styles['profile-create-input']}
                            autoFocus
                        />
                        {error && <p className={styles['profile-create-error']}>{error}</p>}
                    </div>

                    <div className={styles['profile-create-buttons']}>
                        <button onClick={handleCreate} className={styles['btn']}>저장</button>
                        <button onClick={() => navigate('main')} className={styles['btn']}>취소</button>
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
                        <span className="info-value">{hostMember?.name ?? '???'}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProfileCreatePage;