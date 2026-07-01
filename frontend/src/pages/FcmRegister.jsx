import { useState, useEffect, useRef } from 'react';
import { getTeachers, registerFcmToken } from '../api';
import { requestFcmToken, messaging, onMessage } from '../firebase';

const selectStyle = {
  width: '100%', padding: '0.65rem 1rem',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '0.95rem', background: '#f8fafc', color: '#1e293b',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

export default function FcmRegister() {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | denied
  const [message, setMessage] = useState('');
  const [fcmMessage, setFcmMessage] = useState(null);

  useEffect(() => {
    getTeachers().then(setTeachers).catch(() => {});
    const unsub = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification;
      setFcmMessage(`${title} — ${body}`);
      // แสดง OS popup แม้จะอยู่ foreground
      navigator.serviceWorker.ready.then(sw => {
        sw.showNotification(title, { body, icon: '/logo.png', requireInteraction: true });
      });
    });
    return () => unsub();
  }, []);

  const subjectGroups = [...new Set(teachers.map(t => t.subjectGroup))].sort();
  const filteredTeachers = filterGroup
    ? teachers.filter(t => t.subjectGroup === filterGroup)
    : teachers;

  const selectedTeacher = teachers.find(t => String(t.id) === teacherId);

  const handleRegister = async () => {
    if (!teacherId) {
      setMessage('กรุณาเลือกชื่อครูก่อนครับ');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('error');
      setMessage('เบราว์เซอร์นี้ไม่รองรับ Push Notification');
      return;
    }

    const token = await requestFcmToken();
    if (!token) {
      setStatus('denied');
      setMessage('กรุณาอนุญาต Notification ในเบราว์เซอร์แล้วลองใหม่อีกครั้ง');
      return;
    }

    try {
      await registerFcmToken(Number(teacherId), token);
      setStatus('success');
      setMessage(`ลงทะเบียนเรียบร้อย! ${selectedTeacher.prefix}${selectedTeacher.firstName} ${selectedTeacher.lastName} จะได้รับการแจ้งเตือนบนอุปกรณ์นี้`);
    } catch {
      setStatus('error');
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        border: '1px solid #e8edf5', padding: '2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔔</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            ลงทะเบียนรับการแจ้งเตือน
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.4rem' }}>
            เลือกชื่อครูของคุณเพื่อรับการแจ้งเตือนบนอุปกรณ์นี้
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
            กรองตามกลุ่มสาระ
          </div>
          <select
            value={filterGroup}
            onChange={e => { setFilterGroup(e.target.value); setTeacherId(''); }}
            style={selectStyle}
          >
            <option value="">— ครูทั้งหมด —</option>
            {subjectGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
            ชื่อครู
          </div>
          <select
            value={teacherId}
            onChange={e => { setTeacherId(e.target.value); setStatus('idle'); setMessage(''); }}
            style={selectStyle}
          >
            <option value="">— เลือกชื่อครู —</option>
            {filteredTeachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.prefix}{t.firstName} {t.lastName} ({t.clubName})
              </option>
            ))}
          </select>
        </div>

        {selectedTeacher && (
          <div style={{
            background: '#f0f7ff', borderRadius: '10px',
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.88rem', color: '#1a56db',
          }}>
            ชุมนุม: <strong>{selectedTeacher.clubName}</strong>
          </div>
        )}

        {status === 'success' ? (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '12px', padding: '1rem',
            color: '#15803d', fontSize: '0.9rem', textAlign: 'center',
          }}>
            ✅ {message}
          </div>
        ) : (
          <>
            {(status === 'error' || status === 'denied') && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '0.75rem 1rem',
                color: '#b91c1c', fontSize: '0.88rem', marginBottom: '1rem',
              }}>
                {message}
              </div>
            )}
            <button
              onClick={handleRegister}
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '0.85rem',
                background: status === 'loading' ? '#93c5fd' : 'linear-gradient(135deg, #1a56db, #6366f1)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 700,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(26,86,219,0.25)',
              }}
            >
              {status === 'loading' ? 'กำลังลงทะเบียน...' : '🔔 เปิดรับการแจ้งเตือน'}
            </button>
          </>
        )}

        {fcmMessage && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '0.75rem 1rem',
            color: '#15803d', fontSize: '0.88rem', marginTop: '1rem', textAlign: 'center',
          }}>
            🔔 {fcmMessage}
          </div>
        )}
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
          ระบบจะแจ้งเตือนเมื่อใกล้ถึงวันกรอกรายงานชุมนุม
        </p>
      </div>
    </div>
  );
}
