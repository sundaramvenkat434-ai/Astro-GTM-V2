import { redirect } from 'next/navigation';

export default function AdminGifaaEditPage({ params }: { params: { id: string } }) {
  redirect(`/admin/tenants/gifaa/edit/${params.id}`);
}
