import { useState } from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUpdateMeMutation, useChangePasswordMutation, useDeleteMeMutation } from '../api/authApi'
import { useAppSelector } from '../store/hooks'
import type { Gender } from '../types'
import { PageShell } from '../components/PageShell'
import {
  BtnDanger,
  BtnPrimary,
  BtnSecondary,
  ErrorMsg,
  FieldLabel,
  fieldClass,
} from '../modals/base'

const fieldErrorClass =
  'w-full rounded border border-red-500 dark:border-red-500 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed'

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [deleteMe, { isLoading: isDeleting }] = useDeleteMeMutation()
  const isLoading = isSaving || isChangingPassword || isDeleting

  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName, setLastName] = useState(user?.last_name ?? '')
  const [userName, setUserName] = useState(user?.user_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [gender, setGender] = useState<Gender | ''>(user?.gender ?? '')
  const [error, setError] = useState<string | null>(null)

  const [repeatEmail, setRepeatEmail] = useState('')

  const originalEmail = user?.email ?? ''
  const emailChanged = email !== originalEmail
  const emailConfirmed = !emailChanged || (email.length > 0 && email === repeatEmail)
  const showRepeatEmail = emailChanged && !emailConfirmed
  const emailMismatch = showRepeatEmail

  const [newPassword, setNewPassword] = useState('')
  const [repeatNewPassword, setRepeatNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const newPasswordFilled = newPassword.length > 0
  const newPasswordConfirmed = !newPasswordFilled || (newPassword.length > 0 && newPassword === repeatNewPassword)
  const showRepeatPassword = newPasswordFilled && !newPasswordConfirmed
  const passwordMismatch = showRepeatPassword
  const canSave = emailConfirmed && newPasswordConfirmed && (!newPasswordFilled || currentPassword.length > 0)

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account?\n\n' +
      'This will delete all your predictions and any competition where you are the last admin. ' +
      'This action cannot be undone.'
    )
    if (!confirmed) return
    try {
      await deleteMe().unwrap()
    } catch {
      setError('Failed to delete account. Please try again.')
    }
  }

  async function handleSave() {
    if (!canSave) return
    setError(null)
    try {
      await updateMe({
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        user_name: userName || undefined,
        email: email || undefined,
        gender: (gender as Gender) || undefined,
      }).unwrap()
      if (newPasswordFilled) {
        await changePassword({ current_password: currentPassword, new_password: newPassword }).unwrap()
      }
      navigate('/overview')
    } catch {
      setError('Failed to save changes. Please try again.')
    }
  }

  return (
    <PageShell>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <div className="space-y-6 max-w-lg">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>First name</FieldLabel>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel>Last name</FieldLabel>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Username</FieldLabel>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`${emailMismatch ? fieldErrorClass : fieldClass}${emailConfirmed && emailChanged ? ' pr-9' : ''}`}
                />
                {emailConfirmed && emailChanged && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" aria-hidden="true" />
                )}
              </div>
            </div>
            {showRepeatEmail && (
              <div>
                <FieldLabel>Repeat new email</FieldLabel>
                <input
                  type="email"
                  value={repeatEmail}
                  onChange={(e) => setRepeatEmail(e.target.value)}
                  disabled={isLoading}
                  className={emailMismatch ? fieldErrorClass : fieldClass}
                />
              </div>
            )}
            <div>
              <FieldLabel>Gender</FieldLabel>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
                disabled={isLoading}
                className={fieldClass}
              >
                <option value="">— not specified —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Change Password</h2>
            <div>
              <FieldLabel>New password</FieldLabel>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className={`${passwordMismatch ? fieldErrorClass : fieldClass}${newPasswordConfirmed && newPasswordFilled ? ' pr-9' : ''}`}
                />
                {newPasswordConfirmed && newPasswordFilled && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" aria-hidden="true" />
                )}
              </div>
            </div>
            {showRepeatPassword && (
              <div>
                <FieldLabel>Repeat new password</FieldLabel>
                <input
                  type="password"
                  value={repeatNewPassword}
                  onChange={(e) => setRepeatNewPassword(e.target.value)}
                  disabled={isLoading}
                  className={passwordMismatch ? fieldErrorClass : fieldClass}
                />
              </div>
            )}
            {newPasswordFilled && (
              <div>
                <FieldLabel>Current password</FieldLabel>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  className={fieldClass}
                />
              </div>
            )}
          </section>

          <ErrorMsg msg={error} />

          <div className="flex items-center justify-end gap-2">
            <BtnSecondary onClick={() => navigate('/overview')} disabled={isLoading}>
              Cancel
            </BtnSecondary>
            <BtnPrimary onClick={handleSave} disabled={isLoading || !canSave} loading={isSaving || isChangingPassword}>
              {isSaving || isChangingPassword ? 'Saving…' : 'Save'}
            </BtnPrimary>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-red-500">Danger Zone</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently deletes your account, all predictions, and any competition where you are the last admin.
            </p>
            <BtnDanger onClick={handleDeleteAccount} disabled={isLoading} loading={isDeleting}>
              Delete Account
            </BtnDanger>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
