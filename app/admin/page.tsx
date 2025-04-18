import { checkRole } from "@/utils/roles"

export default async function AdminDashboard() {
    let isAdmin = false;
    try {
        isAdmin = await checkRole('admin');
    } catch (error) {
        console.error('Error checking admin role:', error);
        // isAdmin remains false
    }
    if (!isAdmin) {
        return <p>You are not authorized to access this page.</p>;
    }
    return <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>;
}