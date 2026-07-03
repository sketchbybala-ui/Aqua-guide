import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

function PasswordLoginForm({ onSuccess }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn({ email, password })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Logging in…' : 'Log In'}
      </Button>
    </form>
  )
}

function OtpLoginForm({ onSuccess }) {
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSendCode(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) throw otpError
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })
      if (verifyError) throw verifyError
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
        <p className="text-sm text-slate-600">
          We sent a 6-digit code to <span className="font-medium">{email}</span>.
        </p>
        <Input
          label="Enter code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? 'Verifying…' : 'Verify & Log In'}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep('email')
            setCode('')
            setError(null)
          }}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Use a different email
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSendCode} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Sending code…' : 'Send Code'}
      </Button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('password') // 'password' | 'otp'

  function handleSuccess() {
    navigate(location.state?.from?.pathname ?? '/')
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">Log in to Aqua Guide</h1>

      <div className="mb-6 flex rounded-lg border border-slate-200 p-1">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            mode === 'password' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            mode === 'otp' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Log in with OTP
        </button>
      </div>

      {mode === 'password' ? (
        <PasswordLoginForm onSuccess={handleSuccess} />
      ) : (
        <OtpLoginForm onSuccess={handleSuccess} />
      )}

      <p className="mt-4 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
