import { redirect } from 'next/navigation';

// Legacy route — onboarding lives at /onboarding.
export default function CompleteProfileRedirect() {
  redirect('/onboarding');
}
