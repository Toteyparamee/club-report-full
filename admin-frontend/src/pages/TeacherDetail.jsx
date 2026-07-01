import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeacher, deleteReport } from '../api';

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getTeacher(id)
      .then(setTeacher)
      .catch(() => setError('ไม่พบข้อมูล'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async (reportId) => {
    if (!confirm('ยืนยันการลบรายงานนี้?')) return;
    try {
      await deleteReport(reportId);
      load();
    } catch {
      alert('ลบไม่สำเร็จ');
    }
  };

  if (loading) return <div className="page"><p style={{ color: '#9ca3af' }}>กำลังโหลด...</p></div>;
  if (error || !teacher) return <div className="page"><div className="alert alert-error">{error || 'ไม่พบข้อมูล'}</div></div>;

  return (
    <div className="page">
      <div className="back-link" onClick={() => navigate('/')}>
        ← กลับ
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          {teacher.prefix}{teacher.firstName} {teacher.lastName}
        </h2>
        <span className="badge badge-blue">{teacher.subjectGroup}</span>
        <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.9rem' }}>
          รายงานทั้งหมด {teacher.reports.length} ครั้ง
        </p>
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>
        รายการรายงานการสอน
      </h3>

      {teacher.reports.length === 0 ? (
        <div className="empty-state"><p>ยังไม่มีรายงาน</p></div>
      ) : (
        <div className="table-wrap card" style={{ padding: '0.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่อชุมนุม</th>
                <th>ระดับชั้น</th>
                <th>วันที่จัดกิจกรรม</th>
                <th>นักเรียนทั้งหมด</th>
                <th>ขาดเรียน</th>
                <th>หลักฐาน</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teacher.reports.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{teacher.clubName}</td>
                  <td><span className="badge badge-green">{r.gradeLevel}</span></td>
                  <td>{new Date(r.activityDate).toLocaleDateString('th-TH')}</td>
                  <td>{r.totalStudents}</td>
                  <td>{r.absentStudents}</td>
                  <td>
                    {r.evidenceFiles.length > 0 ? (
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
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
