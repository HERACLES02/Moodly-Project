import prisma from '@/lib/prisma'

export default async function AdminPage() {
  const users = await prisma.user.findMany()
  
  return (
    <div>
      <h1>Admin Panel</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.anonymousName}</td>
              <td>{user.isBanned ? 'Banned' : 'Active'}</td>
              <td>
                <form action="/api/admin/edit" method="post" style={{display: 'inline'}}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input name="anonymousName" defaultValue={user.anonymousName} />
                  <button>Update</button>
                </form>
                <form action="/api/admin/ban" method="post" style={{display: 'inline'}}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button>{user.isBanned ? 'Unban' : 'Ban'}</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}