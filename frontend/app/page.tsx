"use client";

import { useCallback, useEffect, useState } from "react";

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

type IconName =
  | "address"
  | "arrow"
  | "close"
  | "mail"
  | "map"
  | "moon"
  | "pencil"
  | "phone"
  | "plus"
  | "search"
  | "sun"
  | "trash"
  | "users";

const iconPaths: Record<IconName, string> = {
  address: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM8 9h8M8 13h5",
  arrow: "M7 17 17 7M8 7h9v9",
  close: "m6 6 12 12M18 6 6 18",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  map: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  moon: "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z",
  pencil: "m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z",
  phone: "M7 3h10v18H7zM10 6h4M11 18h2",
  plus: "M12 5v14M5 12h14",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  sun: "M12 3v2M12 19v2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M3 12h2m14 0h2M5.64 18.36l1.42-1.42m9.88-9.88 1.42-1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3",
  users: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
};

function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load your contacts. Please try again.");
      }

      const data: Contact[] = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load your contacts. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    setDarkMode(localStorage.getItem("contact-manager-theme") === "dark");
  }, []);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    localStorage.setItem("contact-manager-theme", nextDarkMode ? "dark" : "light");
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(false);
  };

  const openNewContactForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("We couldn’t save this contact. Please try again.");
      }

      await fetchContacts();
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving this contact.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Could not delete this contact. Please try again.");
      }
      setContacts((current) => current.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting this contact.",
      );
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
    });
    setEditingId(contact._id);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = search.trim().toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query)
    );
  });

  return (
    <main className={`app-shell${darkMode ? " theme-dark" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Contact Manager home">
          <span className="brand-mark">
            <Icon name="address" size={21} />
          </span>
          <span className="brand-name">Contact Manager</span>
        </a>
        <div className="topbar-tools">
          <span className="topbar-caption">
            <span className="online-dot" />
            Your contact list
          </span>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            aria-pressed={darkMode}
          >
            <Icon name={darkMode ? "sun" : "moon"} size={17} />
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </header>

      <div className="main-area">
        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">CONTACTS</div>
              <h1>Your contacts</h1>
              <p className="page-description">
                Add, search, and manage your contacts in one place.
              </p>
            </div>
            <button className="button button-primary" onClick={openNewContactForm}>
              <Icon name="plus" size={18} />
              <span>Add a contact</span>
            </button>
          </section>

          {showForm && (
            <section className="form-panel" aria-labelledby="form-title">
              <div className="form-heading">
                <div>
                  <div className="eyebrow">{editingId ? "CONTACT DETAILS" : "NEW CONNECTION"}</div>
                  <h2 id="form-title">{editingId ? "Edit contact" : "Add someone new"}</h2>
                  <p>All fields are required so their details are easy to find.</p>
                </div>
                <button
                  className="icon-button close-button"
                  onClick={resetForm}
                  type="button"
                  aria-label="Close form"
                >
                  <Icon name="close" size={19} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="field">
                    <span>Full name</span>
                    <input
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                      placeholder="e.g. Alex Morgan"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Email address</span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      placeholder="alex@example.com"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Address</span>
                    <input
                      name="address"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                      placeholder="City, country"
                      required
                    />
                  </label>
                </div>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="form-actions">
                  <button className="button button-quiet" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                  <button className="button button-primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "Save changes" : "Save contact"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="directory-section" id="directory">
            <div className="directory-heading">
              <div>
                <div className="directory-title-row">
                  <h2>Your people</h2>
                  <span className="result-count">{filteredContacts.length}</span>
                </div>
                <p>All your connections, together in one place.</p>
              </div>
              <label className="search-box">
                <Icon name="search" size={18} />
                <input
                  type="search"
                  aria-label="Search contacts"
                  placeholder="Search your contacts"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <Icon name="close" size={15} />
                  </button>
                )}
              </label>
            </div>

            {loading ? (
              <div className="state-panel">
                <span className="loading-spinner" />
                <p>Gathering your contacts…</p>
              </div>
            ) : loadError ? (
              <div className="state-panel state-error" role="alert">
                <span className="state-icon"><Icon name="address" size={22} /></span>
                <h3>We couldn’t reach your directory.</h3>
                <p>{loadError}</p>
                <button className="button button-secondary" onClick={() => void fetchContacts()}>
                  Try again
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="state-panel">
                <span className="state-icon"><Icon name={search ? "search" : "users"} size={22} /></span>
                <h3>{search ? "No matches this time." : "Your directory starts here."}</h3>
                <p>
                  {search
                    ? "Try a different name, email, phone, or address."
                    : "Add your first contact and keep their details close at hand."}
                </p>
                {!search && (
                  <button className="button button-primary" onClick={openNewContactForm}>
                    <Icon name="plus" size={17} />
                    Add your first contact
                  </button>
                )}
              </div>
            ) : (
              <div className="contacts-grid">
                {filteredContacts.map((contact) => (
                  <article className="contact-card" key={contact._id}>
                    <div className="contact-card-heading">
                      <span className="contact-avatar">{getInitials(contact.name)}</span>
                      <div className="contact-card-identity">
                        <h3 className="contact-name">{contact.name}</h3>
                        <span className="contact-card-label">PERSONAL CONTACT</span>
                      </div>
                    </div>
                    <div className="contact-card-details">
                      <a className="contact-detail" href={`mailto:${contact.email}`}>
                        <span className="contact-detail-icon"><Icon name="mail" size={16} /></span>
                        <span>{contact.email}</span>
                      </a>
                      <a className="contact-detail" href={`tel:${contact.phone}`}>
                        <span className="contact-detail-icon"><Icon name="phone" size={16} /></span>
                        <span>{contact.phone}</span>
                      </a>
                      <span className="contact-detail">
                        <span className="contact-detail-icon"><Icon name="map" size={16} /></span>
                        <span>{contact.address}</span>
                      </span>
                    </div>
                    <div className="contact-card-actions">
                      <button
                        className="card-action"
                        onClick={() => handleEdit(contact)}
                        aria-label={`Edit ${contact.name}`}
                      >
                        <Icon name="pencil" size={15} />
                        Edit contact
                      </button>
                      <button
                        className="card-action card-action-delete"
                        onClick={() => void handleDelete(contact._id)}
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Icon name="trash" size={15} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                <div className="contacts-footer">
                  <span>
                    Showing <strong>{filteredContacts.length}</strong> of{" "}
                    <strong>{contacts.length}</strong>{" "}
                    {contacts.length === 1 ? "contact" : "contacts"}
                  </span>
                  <span className="table-footer-note">
                    <Icon name="arrow" size={14} />
                    Select a card to manage a connection
                  </span>
                </div>
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>Made for keeping people close.</span>
            <span>KINDRED <span className="footer-dot">·</span> YOUR PERSONAL DIRECTORY</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
