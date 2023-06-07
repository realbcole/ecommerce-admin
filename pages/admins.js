import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import { formatDate } from '@/lib/formatDate';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withSwal } from 'react-sweetalert2';

const AdminsPage = ({ swal }) => {
  const [email, setEmail] = useState('');
  const [adminEmails, setAdminEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function addAdmin(e) {
    e.preventDefault();
    await axios
      .post('/api/admins', { email })
      .then((response) => {
        swal.fire({
          title: 'Admin created!',
          icon: 'success',
        });
        setEmail('');
        loadAdmins();
      })
      .catch((err) => {
        swal.fire({
          title: 'Admin not created!',
          text: err.response.data.message,
          icon: 'error',
        });
      });
  }

  function loadAdmins() {
    setIsLoading(true);
    axios.get('/api/admins').then((response) => {
      setAdminEmails(response.data);
      setIsLoading(false);
    });
  }

  function deleteAdmin(admin) {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete admin ${admin.email}?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        confirmButtonColor: '#d55',
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          axios.delete(`/api/admins?id=${admin._id}`).then((response) => {
            loadAdmins();
          });
        }
      });
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <Layout>
      <h1>Admins</h1>
      <h2>Add new admin</h2>
      <form
        className="flex gap-2 justify-center items-center"
        onSubmit={addAdmin}
      >
        <input
          type="text"
          placeholder="Email"
          className="m-0 text-lg py-0.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-primary !py-1 text-lg" type="submit">
          Add
        </button>
      </form>
      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <Spinner />
        </div>
      ) : (
        <table className="basic mt-4">
          <thead>
            <tr>
              <th className="text-left">Existing Admins</th>
            </tr>
          </thead>
          <tbody>
            {adminEmails.length > 0 &&
              adminEmails.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.email}</td>
                  <td>{admin.createdAt && formatDate(admin.createdAt)}</td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => deleteAdmin(admin)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }) => <AdminsPage swal={swal} />);
