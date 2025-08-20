import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect to the new admin panel
  redirect('/admin-panel');
}