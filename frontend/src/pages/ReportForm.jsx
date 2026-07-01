import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers, createReport } from '../api';

const GRADE_LEVELS = ['ม.ต้น','ม.ปลาย','รวม(ม.ต้น+ม.ปลาย)'];

function ChipGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(selected ? '' : opt)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              border: selected ? '2px solid #1a56db' : '1.5px solid #e2e8f0',
              background: selected ? '#eff4ff' : '#f8fafc',
              color: selected ? '#1a56db' : '#475569',
              fontWeight: selected ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              boxShadow: selected ? '0 0 0 3px rgba(26,86,219,0.1)' : 'none',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ color: '#1a56db', fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>{title}</span>
    </div>
  );
}

function FormLabel({ children }) {
  return (
    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
      {children}
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '0.65rem 1rem',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '0.95rem', background: '#f8fafc', color: '#1e293b',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

export default function ReportForm() {
  const navigate = useNavigate();
  const [allTeachers, setAllTeachers] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    teacherId: '',
    subjectGroup: '',
    clubName: '',
    gradeLevel: '',
    activityDate: new Date().toISOString().slice(0, 10),
    totalStudents: '',
    absentStudents: '',
  });

  const [filterGroup, setFilterGroup] = useState('');

  useEffect(() => {
    getTeachers().then(setAllTeachers).catch(() => {});
  }, []);

  const subjectGroups = [...new Set(allTeachers.map(t => t.subjectGroup))].sort();

  const filteredTeachers = filterGroup
    ? allTeachers.filter(t => t.subjectGroup === filterGroup)
    : allTeachers;

  const handleFilterGroupChange = (e) => {
    setFilterGroup(e.target.value);
    setForm(f => ({ ...f, teacherId: '', subjectGroup: '', clubName: '' }));
  };

  const handleTeacherChange = (e) => {
    const id = e.target.value;
    const teacher = allTeachers.find(t => String(t.id) === id);
    setForm(f => ({
      ...f,
      teacherId: id,
      subjectGroup: teacher ? teacher.subjectGroup : '',
      clubName: teacher ? teacher.clubName : '',
      gradeLevel: teacher?.gradeLevel || f.gradeLevel,
      totalStudents: teacher?.totalStudents != null && teacher.totalStudents > 0
        ? String(teacher.totalStudents)
        : f.totalStudents,
    }));
  };

  const setField = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setInput = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedTeacher = allTeachers.find(t => String(t.id) === String(form.teacherId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.teacherId) return setError('กรุณาเลือกครูผู้สอน');
    if (!form.gradeLevel) return setError('กรุณาเลือกระดับชั้น');
    if (!form.activityDate) return setError('กรุณาระบุวันที่จัดกิจกรรม');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('teacherId', form.teacherId);
      fd.append('gradeLevel', form.gradeLevel);
      fd.append('activityDate', form.activityDate);
      fd.append('totalStudents', form.totalStudents || 0);
      fd.append('absentStudents', form.absentStudents || 0);
      files.forEach(f => fd.append('evidenceFiles', f));
      await createReport(fd);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const thaiDate = form.activityDate
    ? new Date(form.activityDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e8edf5',
    padding: '1.5rem',
    marginBottom: '1rem',
  };

  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem' }}>
      <button type="button" onClick={() => navigate(-1)} className="back-link">
        ← กลับ
      </button>
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem',
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem',
        }}>บันทึกรายงานเรียบร้อยแล้ว กำลังกลับหน้าหลัก...</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <SectionTitle icon="👤" title="ข้อมูลผู้สอน" />

          <FormLabel>กรองตามกลุ่มสาระ (ไม่บังคับ)</FormLabel>
          <div style={{ marginBottom: '1.1rem' }}>
            <select value={filterGroup} onChange={handleFilterGroupChange} style={selectStyle}>
              <option value="">— ครูทั้งหมด —</option>
              {subjectGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <FormLabel>ครูผู้สอน</FormLabel>
          <div style={{ marginBottom: '1.1rem' }}>
            <select value={form.teacherId} onChange={handleTeacherChange} style={selectStyle}>
              <option value="">— เลือกครูผู้สอน —</option>
              {filteredTeachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.prefix}{t.firstName} {t.lastName} ({t.clubName})
                </option>
              ))}
            </select>
          </div>

          <FormLabel>กลุ่มสาระการเรียนรู้</FormLabel>
          <div style={{ marginBottom: '1.1rem' }}>
            <div style={{
              padding: '0.65rem 1rem',
              border: '1.5px solid #e2e8f0', borderRadius: '10px',
              fontSize: '0.95rem',
              background: form.subjectGroup ? '#f0f7ff' : '#f8fafc',
              color: form.subjectGroup ? '#1a56db' : '#94a3b8',
              fontWeight: form.subjectGroup ? 600 : 400,
            }}>
              {form.subjectGroup || '— จะแสดงอัตโนมัติเมื่อเลือกครู —'}
            </div>
          </div>

          <FormLabel>ชื่อชุมนุม</FormLabel>
          <div style={{ marginBottom: '1.1rem' }}>
            <div style={{
              padding: '0.65rem 1rem',
              border: '1.5px solid #e2e8f0', borderRadius: '10px',
              fontSize: '0.95rem',
              background: form.clubName ? '#f0f7ff' : '#f8fafc',
              color: form.clubName ? '#1a56db' : '#94a3b8',
              fontWeight: form.clubName ? 600 : 400,
            }}>
              {form.clubName || '— จะแสดงอัตโนมัติเมื่อเลือกครู —'}
            </div>
          </div>

          <FormLabel>ระดับชั้น</FormLabel>
          <div style={{ marginBottom: '1.1rem' }}>
            <ChipGroup
              options={GRADE_LEVELS}
              value={form.gradeLevel}
              onChange={setField('gradeLevel')}
            />
          </div>

          <FormLabel>วันที่จัดกิจกรรม</FormLabel>
          <div>
            <input
              type="date"
              value={form.activityDate}
              onChange={setInput('activityDate')}
              required
              style={selectStyle}
            />
            {thaiDate && (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                📅 {thaiDate}
              </div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <SectionTitle icon="👥" title="จำนวนนักเรียน" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <FormLabel>จำนวนนักเรียนทั้งหมด</FormLabel>
              <input
                type="number" min="0"
                value={form.totalStudents}
                onChange={setInput('totalStudents')}
                placeholder="0"
                style={selectStyle}
              />
            </div>
            <div>
              <FormLabel>จำนวนนักเรียนที่ขาดเรียน</FormLabel>
              <input
                type="number" min="0"
                value={form.absentStudents}
                onChange={setInput('absentStudents')}
                placeholder="0"
                style={selectStyle}
              />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <SectionTitle icon="📎" title="แนบไฟล์หลักฐาน" />
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            border: '2px dashed #bfdbfe', borderRadius: '10px',
            background: '#f0f7ff', color: '#1a56db',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
          }}>
            <input
              type="file" multiple accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => setFiles(Array.from(e.target.files))}
            />
            + เลือกไฟล์
          </label>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {files.map((f, i) => (
                <span key={i} style={{
                  background: '#e0eaff', color: '#1a56db', borderRadius: '6px',
                  padding: '0.2rem 0.6rem', fontSize: '0.82rem',
                }}>{f.name}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, padding: '0.85rem',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a56db, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(26,86,219,0.25)',
            }}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกรายงาน'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '0.85rem 1.5rem',
              background: '#fff', color: '#64748b',
              border: '1.5px solid #e2e8f0', borderRadius: '12px',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
