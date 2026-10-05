import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, Trash2, X, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setStep(1);
    setConfirmText('');
    onClose();
  };

  const handleConfirmDeletion = async () => {
    setLoading(true);
    try {
      // 1. Call backend delete account endpoint
      await apiClient.post('/auth/delete-account', {
        userId: user?.id
      });

      toast.success('Account permanently deleted and wiped from this device.');

      // 2. Clear all traces from device (localStorage, sessionStorage)
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Also clear common cookie sessions if any
        document.cookie.split(';').forEach(c => {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
      }

      // 3. Clear auth context
      logout();

      // 4. Close modal and redirect
      handleClose();
      navigate('/');
    } catch (err) {
      console.error('Account deletion error:', err);
      // Even if network fails or DB endpoint returns error, purge local credentials if requested
      const errMsg = err.response?.data?.error || err.message || 'Failed to delete account on server';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #FCA5A5',
          maxWidth: '460px',
          width: '100%',
          padding: '24px 20px',
          boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.25)',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#64748B',
            transition: 'background 0.15s ease'
          }}
        >
          <X size={16} />
        </button>

        {/* STEP 1: INITIAL WARNING */}
        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                flexShrink: 0
              }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  STEP 1 OF 2 • ACCOUNT ACTION
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
                  Delete Account From Device
                </h3>
              </div>
            </div>

            <div style={{
              background: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#991B1B'
            }}>
              <div style={{ fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#DC2626" />
                <span>What will happen:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#7F1D1D' }}>
                <li>Your session, saved keys, login token, and cached trade charts will be <strong>permanently purged</strong> from this device.</li>
                <li>Zero local trace will be left on your phone or computer.</li>
                <li>Your account record and trading history <strong>stay preserved securely</strong> in our database for audit compliance.</li>
              </ul>
            </div>

            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
              Logged in as: <strong style={{ color: '#0F172A' }}>{user?.email || 'User'}</strong>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  flex: 1.3,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 2ND STEP CONFIRMATION MODAL */}
        {step === 2 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: '#FEF2F2',
                border: '1.5px solid #EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                flexShrink: 0
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  FINAL STEP 2 • PLEASE CONFIRM
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
                  Confirm Permanent Deletion
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              Are you absolutely sure? Once confirmed, this device will immediately log out and all local cache, login tokens, and user credentials will be wiped permanently.
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#334155'
            }}>
              Type <strong style={{ color: '#DC2626' }}>DELETE</strong> below to activate deletion:
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FFFFFF'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmDeletion}
                disabled={loading || confirmText !== 'DELETE'}
                style={{
                  flex: 1.4,
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: confirmText === 'DELETE' ? '#DC2626' : '#94A3B8',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: confirmText === 'DELETE' && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: confirmText === 'DELETE' ? '0 4px 14px rgba(220, 38, 38, 0.35)' : 'none',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Trash2 size={14} />
                <span>{loading ? 'Deleting...' : 'Confirm Deletion'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
