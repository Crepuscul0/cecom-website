import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect to the Spanish admin by default
  redirect('/es/admin');
}