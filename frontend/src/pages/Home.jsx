import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../api';

const HEALTH_URL = 'https://clubreport.parameedev.online/api/health';
const POLL_INTERVAL = 30_000; // 30 วินาที

export default function Home() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const wasDownRef = useRef(false);

  // health check loop
  useEffect(() => {
    let timer;

    async function checkHealth() {
      try {
        const res = await fetch(HEALTH_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('not ok');
        setServerDown(false);
        wasDownRef.current = false;
      } catch {
        if (!wasDownRef.current) {
          // เพิ่งตรวจพบว่าล่ม — แจ้ง backend ให้ set flag
          wasDownRef.current = true;
          fetch('https://clubreport.parameedev.online/api/settings/server-down', {
            method: 'POST',
          }).catch(() => {});
        }
        setServerDown(true);
      }
      timer = setTimeout(checkHealth, POLL_INTERVAL);
    }

    checkHealth();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      padding: '2rem',
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f4f6fb 60%, #fce8f3 100%)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Server down banner */}
        {serverDown && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fca5a5',
            borderRadius: '14px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#b91c1c',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.97rem' }}>ขณะนี้ไม่สามารถกรอกรายงานได้</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.2rem', color: '#dc2626' }}>
                เนื่องจาก Server ขัดข้องอยู่ในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง
              </div>
            </div>
          </div>
        )}

        {/* Hero card */}
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(26,86,219,0.10)',
          padding: '3rem 3.5rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          margin: '0 auto 2.5rem',
        }}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 1.5rem', display: 'block' }}
          />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.35, marginBottom: '0.6rem' }}>
            ระบบรายงานผลการดำเนินกิจกรรมชุมนุม
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            กรุณาเลือกประเภทการใช้งาน
          </p>

          <button
            onClick={() => !serverDown && navigate('/report/new')}
            disabled={serverDown}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.5rem',
              background: serverDown
                ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)'
                : 'linear-gradient(135deg, #1a56db, #6366f1)',
              color: '#fff',
              border: 'none', borderRadius: '14px',
              cursor: serverDown ? 'not-allowed' : 'pointer',
              fontSize: '1rem', fontWeight: 600,
              fontFamily: 'inherit', width: '100%',
              boxShadow: serverDown ? 'none' : '0 4px 14px rgba(26,86,219,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              opacity: serverDown ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!serverDown) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,86,219,0.4)'; } }}
            onMouseLeave={e => { if (!serverDown) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,86,219,0.3)'; } }}
          >
            <span style={{
              width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                {serverDown ? 'ไม่สามารถกรอกได้ (Server ขัดข้อง)' : 'กรอกรายงาน'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 400 }}>บันทึกผลการดำเนินกิจกรรมชุมนุม</div>
            </div>
          </button>
        </div>

        {/* ตารางรายงานล่าสุด */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            รายงานล่าสุด
          </h2>

          {loading ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>กำลังโหลด...</p>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>ยังไม่มีรายงาน</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.93rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5ff' }}>
                    <th style={th}>#</th>
                    <th style={th}>ครูผู้สอน</th>
                    <th style={th}>ชุมนุม</th>
                    <th style={th}>กลุ่มสาระ</th>
                    <th style={th}>ระดับชั้น</th>
                    <th style={th}>วันที่จัดกิจกรรม</th>
                    <th style={th}>นักเรียนทั้งหมด</th>
                    <th style={th}>ขาดเรียน</th>
                    <th style={th}>หลักฐาน</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={td}>{i + 1}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.teacher?.prefix}{r.teacher?.firstName} {r.teacher?.lastName}</td>
                      <td style={td}>{r.teacher?.clubName}</td>
                      <td style={td}><span style={badgeBlue}>{r.teacher?.subjectGroup}</span></td>
                      <td style={td}><span style={badgeGreen}>{r.gradeLevel}</span></td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(r.activityDate).toLocaleDateString('th-TH')}</td>
                      <td style={td}>{r.totalStudents}</td>
                      <td style={td}>{r.absentStudents}</td>
                      <td style={td}>
                        {r.evidenceFiles?.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {r.evidenceFiles.map(f => (
                              <a
                                key={f.id}
                                href={`https://clubreport.parameedev.online/files/${f.filePath}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#1a56db', fontSize: '0.82rem', textDecoration: 'underline' }}
                              >
                                {f.fileName}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>ไม่มีไฟล์</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ marginTop: '2rem', color: '#cbd5e1', fontSize: '0.8rem', textAlign: 'center' }}>
          ระบบรายงานกิจกรรมชุมนุม · โรงเรียน
        </p>
      </div>
    </div>
  );
}

const th = { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151' };
const td = { padding: '0.75rem 1rem', textAlign: 'left' };
const badgeBlue = { display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: '#dbeafe', color: '#1e40af' };
const badgeGreen = { display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: '#d1fae5', color: '#065f46' };
