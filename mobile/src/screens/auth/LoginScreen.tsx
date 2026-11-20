import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Mail, Lock, LogIn, Shield, KeyRound, Sparkles, CheckSquare, Square, Building2 } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { DEMO_ACCOUNTS } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { api } from '../../services/api';

export const LoginScreen: React.FC = () => {
  const { login, ssoLogin, isLoading } = useAuth();
  // Default to Administrator so the user lands directly in the SaaS Dashboard
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS.admin.email);
  const [password, setPassword] = useState<string>(DEMO_ACCOUNTS.admin.password);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<string>('');
  const [showSsoModal, setShowSsoModal] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide both university email and password.');
      return;
    }
    setError('');
    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickDemoFill = (type: 'admin' | 'faculty' | 'student') => {
    setSelectedRole(type);
    const account = DEMO_ACCOUNTS[type];
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSsoSubmit = async (role: 'admin' | 'faculty') => {
    setShowSsoModal(false);
    try {
      await ssoLogin(role);
    } catch (err: any) {
      setError(err.message || 'SSO simulation authentication failed.');
    }
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail) {
      setForgotMessage('Please enter your university email.');
      return;
    }
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMessage(res.message);
    } catch (err: any) {
      setForgotMessage(err.message || 'Error requesting reset.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginWrapper}>
          {/* University Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>EduNova</Text>
            <Text style={styles.appTagline}>Smart Faculty Timetable Management System</Text>
            <View style={styles.institutionBadge}>
              <Building2 size={12} color={COLORS.secondary} />
              <Text style={styles.institutionText}>City University Institutional Portal</Text>
            </View>
          </View>

          {/* Main Card */}
          <View style={styles.formCard}>
            {/* Quick Demo Role Selector */}
            <View style={styles.demoSection}>
              <View style={styles.demoSectionHeader}>
                <KeyRound size={14} color={COLORS.secondary} />
                <Text style={styles.demoSectionTitle}>Select Demo Account</Text>
              </View>

              <View style={styles.rolePillsRow}>
                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    selectedRole === 'admin' && styles.rolePillActive,
                  ]}
                  onPress={() => handleQuickDemoFill('admin')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleDot, selectedRole === 'admin' && styles.roleDotActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rolePillTitle, selectedRole === 'admin' && styles.rolePillTitleActive]}>
                      Administrator
                    </Text>
                    <Text style={styles.rolePillSub}>Coordinator Portal</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    selectedRole === 'faculty' && styles.rolePillActive,
                  ]}
                  onPress={() => handleQuickDemoFill('faculty')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleDot, selectedRole === 'faculty' && styles.roleDotActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rolePillTitle, selectedRole === 'faculty' && styles.rolePillTitleActive]}>
                      Faculty
                    </Text>
                    <Text style={styles.rolePillSub}>Dr. Jenkins</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rolePill,
                    selectedRole === 'student' && styles.rolePillActive,
                  ]}
                  onPress={() => handleQuickDemoFill('student')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleDot, selectedRole === 'student' && styles.roleDotActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rolePillTitle, selectedRole === 'student' && styles.rolePillTitleActive]}>
                      Student
                    </Text>
                    <Text style={styles.rolePillSub}>Sec CS-A</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form Inputs */}
            <View style={styles.inputsArea}>
              <Input
                label="University Email"
                placeholder="id@edunova.edu"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={16} color={COLORS.textMuted} />}
              />

              <Input
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setError('');
                }}
                secureTextEntry
                leftIcon={<Lock size={16} color={COLORS.textMuted} />}
              />

              {/* Remember Me & Forgot Password */}
              <View style={styles.metaRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  {rememberMe ? (
                    <CheckSquare size={16} color={COLORS.secondary} />
                  ) : (
                    <Square size={16} color={COLORS.textMuted} />
                  )}
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setForgotMessage('');
                    setShowForgotModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                title={isLoading ? 'Signing In...' : 'Sign In to Portal'}
                onPress={handleLogin}
                loading={isLoading}
                icon={<LogIn size={16} color={COLORS.textOnDark} />}
                style={styles.signInBtn}
              />

              {/* SSO Divider */}
              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Institutional SSO Demo Button */}
              <TouchableOpacity
                style={styles.ssoBtn}
                onPress={() => setShowSsoModal(true)}
                activeOpacity={0.8}
              >
                <Shield size={16} color={COLORS.secondary} />
                <Text style={styles.ssoBtnText}>Institutional SSO Login (Demo)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>EduNova University Timetable Management System</Text>
            <Text style={styles.footerSub}>Constraint-Based Intelligent Scheduling & Real-Time Sync</Text>
          </View>
        </View>

        {/* Forgot Password Modal */}
        <ModalWrapper
          visible={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          title="Reset Password"
          subtitle="Password recovery for institutional accounts"
        >
          <Text style={styles.modalBodyText}>
            Enter your official university email address below. A secured temporary credentials link will be sent to your inbox.
          </Text>

          <Input
            label="University Email"
            value={forgotEmail}
            onChangeText={setForgotEmail}
            placeholder="name@edunova.edu"
            keyboardType="email-address"
          />

          {forgotMessage ? (
            <Text style={styles.forgotSuccessText}>{forgotMessage}</Text>
          ) : null}

          <Button
            title="Send Reset Instructions"
            onPress={handleForgotPasswordSubmit}
            style={{ marginTop: SPACING.md }}
          />
        </ModalWrapper>

        {/* Institutional SSO Demo Modal */}
        <ModalWrapper
          visible={showSsoModal}
          onClose={() => setShowSsoModal(false)}
          title="Institutional Single Sign-On"
          subtitle="SSO-Ready Architecture (Demo Mode)"
        >
          <View style={styles.ssoNoticeBox}>
            <Shield size={20} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ssoNoticeTitle}>SSO Integration Notice</Text>
              <Text style={styles.ssoNoticeBody}>
                Production institutional SSO (SAML 2.0 / Shibboleth / Microsoft Entra ID) requires campus federation authority credentials. This application includes an SSO-ready authentication pipeline currently operating in verified demo mode.
              </Text>
            </View>
          </View>

          <Text style={styles.ssoSelectPrompt}>
            Select identity assertion to simulate:
          </Text>

          <TouchableOpacity
            style={styles.ssoOptionCard}
            onPress={() => handleSsoSubmit('admin')}
          >
            <View style={[styles.ssoOptionBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.ssoOptionLetter}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ssoOptionTitle}>Simulate Timetable Coordinator SSO</Text>
              <Text style={styles.ssoOptionSub}>University Registrar Administrator</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ssoOptionCard}
            onPress={() => handleSsoSubmit('faculty')}
          >
            <View style={styles.ssoOptionBadge}>
              <Text style={styles.ssoOptionLetter}>F</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ssoOptionTitle}>Simulate Faculty Member SSO</Text>
              <Text style={styles.ssoOptionSub}>Dr. Sarah Jenkins (Computer Science)</Text>
            </View>
          </TouchableOpacity>
        </ModalWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  loginWrapper: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  institutionText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  formCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.lg,
  },
  demoSection: {
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.md,
  },
  demoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rolePillsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  rolePillActive: {
    borderColor: COLORS.secondary,
    backgroundColor: '#EFF6FF',
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  roleDotActive: {
    backgroundColor: COLORS.secondary,
  },
  rolePillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  rolePillTitleActive: {
    color: COLORS.primary,
  },
  rolePillSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputsArea: {
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  forgotLink: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  signInBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    paddingHorizontal: SPACING.sm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ssoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
    backgroundColor: COLORS.surfaceBlue,
  },
  ssoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerNote: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  modalBodyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  forgotSuccessText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  ssoNoticeBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceBlue,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.md,
  },
  ssoNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  ssoNoticeBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  ssoSelectPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ssoOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  ssoOptionBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ssoOptionLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textOnDark,
  },
  ssoOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ssoOptionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
