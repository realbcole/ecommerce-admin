import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import { formatDate } from '../lib/formatDate';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

// Admins Page
// Allows user to add and delete admins
const AdminsPage = ({ swal }) => {
  const [email, setEmail] = useState('');
  const [adminEmails, setAdminEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // On start, load admins
  useEffect(() => {
    loadAdmins();
  }, []);

  function loadAdmins() {
    setIsLoading(true);
    axios.get('/api/admins').then((response) => {
      setAdminEmails(response.data);
      setIsLoading(false);
    });
  }

  async function addAdmin(e) {
    e.preventDefault();
    await axios
      .post('/api/admins', { email })
      .then(() => {
        swal.fire({
          title: 'Admin created!',
          icon: 'success',
          background: '#E0FBFC',
          confirmButtonColor: '#293241',
          iconColor: '#293241',
        });
        setEmail('');
        loadAdmins();
      })
      .catch((err) => {
        swal.fire({
          title: 'Admin not created!',
          text: err.response.data.message,
          icon: 'error',
          background: '#E0FBFC',
          confirmButtonColor: '#293241',
          iconColor: '#293241',
        });
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
        confirmButtonColor: '#293241',
        background: '#E0FBFC',
        iconColor: '#293241',
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

  return (
    <Layout>
      <h1>Admins</h1>
      <h2>Add new admin</h2>
      <form
        className="flex gap-2 justify-center items-center"
        onSubmit={addAdmin}
      >
        {/* Email input */}
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
      {/* Admins table */}
      {isLoading ? (
        <Spinner className="mt-8" />
      ) : (
        <table className="basic mt-4">
          <thead>
            <tr className="text-center">
              <th>Existing Admins</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adminEmails.length > 0 &&
              adminEmails.map((admin) => (
                <tr
                  key={admin._id}
                  className="border border-primaryDark text-center"
                >
                  <td>{admin.email}</td>
                  <td>{admin.createdAt && formatDate(admin.createdAt)}</td>
                  <td className="flex justify-end">
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
