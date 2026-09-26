
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/contacts";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Get all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data: Contact[] = await response.json();

      setContacts(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load contacts when page opens
  useEffect(() => {
    fetchContacts();
  }, []);

  // Input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add / Update contact
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      await fetchContacts();

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });

      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong!");
    }
  };

  // Delete contact
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setContacts((prev) =>
        prev.filter((contact) => contact._id !== id)
      );
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete contact!");
    }
  };

  // Edit contact
  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
    });

    setEditingId(contact._id);
    setShowForm(true);
  };

  // Search
  const filteredContacts = contacts.filter((contact) => {
    const text = search.toLowerCase();

    return (
      contact.name.toLowerCase().includes(text) ||
      contact.email.toLowerCase().includes(text) ||
      contact.phone.toLowerCase().includes(text)
    );
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-10">

        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
              Contact Manager
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Manage your{" "}
              <span className="text-cyan-400">
                contacts.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-slate-400">
              Add, edit, search and manage your contacts
              easily from one place.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:bg-cyan-400 active:scale-95"
          >
            {showForm ? "Close Form" : "+ Add Contact"}
          </button>
        </header>

        {/* Form */}
        {showForm && (
          <section className="mb-10 animate-[fadeIn_.3s_ease-out] rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">

            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {editingId
                  ? "Edit Contact"
                  : "Add New Contact"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {editingId
                  ? "Update the contact information."
                  : "Enter the contact information below."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />

              <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition duration-300 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] sm:col-span-2"
              >
                {editingId
                  ? "Update Contact"
                  : "Save Contact"}
              </button>

            </form>
          </section>
        )}

        {/* Search + Total */}
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-11 py-3 text-white outline-none transition focus:border-cyan-400"
            />

          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">

            <span className="text-sm text-slate-400">
              Total contacts
            </span>

            <span className="ml-3 font-bold text-cyan-400">
              {contacts.length}
            </span>

          </div>
        </section>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          </div>

        ) : filteredContacts.length === 0 ? (

          /* Empty */
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-20 text-center">

            <div className="mb-4 text-5xl">
              📭
            </div>

            <h2 className="text-xl font-semibold">
              No contacts found
            </h2>

            <p className="mt-2 text-slate-400">
              Try adding a new contact or changing your search.
            </p>

          </div>

        ) : (

          /* Contact cards */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredContacts.map((contact) => (

              <article
                key={contact._id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/5"
              >

                {/* Card top */}
                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-lg font-bold text-cyan-400">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() => handleEdit(contact)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(contact._id)
                      }
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>

                  </div>
                </div>

                {/* Name */}
                <h2 className="truncate text-xl font-bold">
                  {contact.name}
                </h2>

                {/* Contact info */}
                <div className="mt-5 space-y-3 text-sm">

                  <div className="flex items-center gap-3 text-slate-300">
                    <span>✉️</span>
                    <span className="truncate">
                      {contact.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span>📞</span>
                    <span>
                      {contact.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <span>📍</span>
                    <span className="truncate">
                      {contact.address}
                    </span>
                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </div>
    </main>
  );
}
