import { redirect } from "next/navigation";

export default function IndividualHackathonRedirect({ params }: { params: { id: string } }) {
  // Redirect to the analytics page as the default overview
  redirect(`/organizer/hackathons/${params.id}/analytics`);
}
