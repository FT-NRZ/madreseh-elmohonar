'use client';
import { useState, useEffect } from 'react';
import { useLoading } from '../../components/LoadingProvider';
import Link from 'next/link';

export default function AdminPreRegistrations() {
  const { startLoading, stopLoading } = useLoading() || {};
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line
  }, []);

  const fetchRegistrations = async () => {
    if (startLoading) startLoading();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/admin/dashboard';
        return;
      }
      const response = await fetch('/api/pre-registration', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setRegistrations(result.preRegistrations);
      } else {
        alert('خطا در دریافت اطلاعات: ' + (result.error || 'خطای سرور'));
      }
    } catch (error) {
      console.error('Error fetching pre-registrations:', error);
      alert('خطا در ارتباط با سرور');
    } finally {
      if (stopLoading) stopLoading();
    }
  };

  const updateStatus = async (id, status) => {
    if (startLoading) startLoading();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/admin/dashboard';
        return;
      }
      const response = await fetch(`/api/pre-registration/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(status === 'approved' ? 'درخواست تأیید شد! ✅' : 'درخواست رد شد! ❌');
        fetchRegistrations();
      } else {
        alert('خطا در تغییر وضعیت: ' + (result.error || 'خطای سرور'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('خطا در ارتباط با سرور');
    } finally {
      if (stopLoading) stopLoading();
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  const statusCounts = {
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '20px auto',
      padding: 20,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
    }}>
      {/* هدر */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
      }}>
        <h1 style={{ 
          color: '#399918', 
          fontSize: 24,
          fontWeight: 'bold',
          margin: 0
        }}>
          🎓 مدیریت پیش‌ثبت‌نام‌ها
        </h1>
        <Link href="/admin/dashboard">
          <button style={{
            background: '#f5f5f5',
            color: '#666',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ← بازگشت به داشبورد
          </button>
        </Link>
      </div>

      {/* آمار کلی */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 30
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
          padding: 20,
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#856404' }}>
            {statusCounts.pending}
          </div>
          <div style={{ fontSize: 14, color: '#856404' }}>در انتظار بررسی</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #d1edff, #74b9ff)',
          padding: 20,
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#084298' }}>
            {statusCounts.approved}
          </div>
          <div style={{ fontSize: 14, color: '#084298' }}>تأیید شده</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f8d7da, #fd79a8)',
          padding: 20,
          borderRadius: 12,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#721c24' }}>
            {statusCounts.rejected}
          </div>
          <div style={{ fontSize: 14, color: '#721c24' }}>رد شده</div>
        </div>
      </div>

      {/* فیلتر */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>فیلتر:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 14
          }}
        >
          <option value="all">همه ({registrations.length})</option>
          <option value="pending">در انتظار ({statusCounts.pending})</option>
          <option value="approved">تأیید شده ({statusCounts.approved})</option>
          <option value="rejected">رد شده ({statusCounts.rejected})</option>
        </select>
      </div>

      {/* جدول */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: 14,
          background: '#fff',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>ردیف</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6' }}>نام و نام خانوادگی</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>پایه</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6' }}>شماره تماس</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>تاریخ ثبت</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>وضعیت</th>
              <th style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ 
                  padding: 40, 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: 16
                }}>
                  هیچ درخواستی یافت نشد
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((reg, index) => (
                <tr key={reg.id} style={{
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                }}>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                    {reg.first_name} {reg.last_name}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {reg.grade}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6' }}>
                    <a 
                      href={`tel:${reg.phone}`} 
                      style={{ 
                        color: '#399918', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      📞 {reg.phone}
                    </a>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {reg.created_at ? new Date(reg.created_at).toLocaleDateString('fa-IR') : '-'}
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 'bold',
                      backgroundColor: 
                        reg.status === 'pending' ? '#fff3cd' :
                        reg.status === 'approved' ? '#d1edff' : '#f8d7da',
                      color:
                        reg.status === 'pending' ? '#856404' :
                        reg.status === 'approved' ? '#084298' : '#721c24'
                    }}>
                      {reg.status === 'pending' ? '⏳ در انتظار' :
                       reg.status === 'approved' ? '✅ تأیید شده' : '❌ رد شده'}
                    </span>
                  </td>
                  <td style={{ padding: 12, border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {reg.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => updateStatus(reg.id, 'approved')}
                          style={{
                            background: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(40,167,69,0.3)'
                          }}
                        >
                          ✅ تأیید
                        </button>
                        <button
                          onClick={() => updateStatus(reg.id, 'rejected')}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(220,53,69,0.3)'
                          }}
                        >
                          ❌ رد
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#666', fontSize: 12 }}>
                        {reg.status === 'approved' ? 'تأیید شده' : 'رد شده'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}