import { Metadata } from 'next'

import LoginTemplate from '@modules/account/templates/login-template'

export const metadata: Metadata = {
  title: 'Sign in | NAAZ (ناز)',
  description: 'Sign in to your NAAZ Pakistan customer account.',
}

export default function Login() {
  return <LoginTemplate />
}
