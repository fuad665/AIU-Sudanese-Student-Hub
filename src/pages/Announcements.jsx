import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Megaphone,
  Search,
  Calendar,
  User,
  Plus,
  Edit2,
  Trash2,
  Share2,
  MessageCircle,
  AlertTriangle,
  Globe,
  Sparkles,
  Award
} from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

const Announcements = () => {
  const {
    announcements,
    currentUser,
    users,
    addAnnouncement,
    editAnnouncement,
    deleteAnnouncement
  } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modals management
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState(null);

  // Form states
  const [annForm, setAnnForm] = useState({ title: '', category: 'General', importance: 'normal', content: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['All', 'General', 'Academic', 'Social', 'Financial'];

  // Check permissions
  const canCreate = currentUser && (currentUser.role === 'admin' || currentUser.role === 'government');
  const canEditDelete = currentUser && currentUser.role === 'admin';

  // Dynamic Author Lookup
  const getAuthorDetails = (authorName) => {
    const matched = users.find((u) => u.name.toLowerCase() === authorName.toLowerCase());
    return {
      photo: matched ? matched.photo : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      role: matched ? matched.role : 'government'
    };
  };

  // Filter lists matching search and categories
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        ann.title.toLowerCase().includes(search.toLowerCase()) ||
        ann.content.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' ? true : ann.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [announcements, search, activeCategory]);

  // Sort: High importance first, then chronological
  const sortedAnnouncements = useMemo(() => {
    return [...filteredAnnouncements].sort((a, b) => {
      if (a.importance === 'high' && b.importance !== 'high') return -1;
      if (a.importance !== 'high' && b.importance === 'high') return 1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [filteredAnnouncements]);

  // WhatsApp Share utility
  const handleShareWhatsApp = (e, ann) => {
    e.stopPropagation(); // prevent modal trigger
    const text = `📢 *SSA Notice: ${ann.title.toUpperCase()}*\n\n${ann.content}\n\n📅 Date: ${ann.date}\n👤 Author: ${ann.author}\n\nShared from the Sudanese Student Association Hub (AIU).`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Form submission: Create or Edit Notice
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      setErrorMsg('Please complete all announcement fields.');
      return;
    }

    if (editingAnnId) {
      editAnnouncement(editingAnnId, annForm);
    } else {
      addAnnouncement(annForm);
    }

    // Reset and close
    setAnnForm({ title: '', category: 'General', importance: 'normal', content: '' });
    setErrorMsg('');
    setIsCreateOpen(false);
    setEditingAnnId(null);
  };

  // Trigger Edit state
  const handleOpenEdit = (e, ann) => {
    e.stopPropagation();
    setEditingAnnId(ann.id);
    setAnnForm({
      title: ann.title,
      category: ann.category,
      importance: ann.importance,
      content: ann.content
    });
    setIsCreateOpen(true);
  };

  // Trigger Delete state
  const handleDelete = (e, ann) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this bulletin notice: "${ann.title}"?`)) {
      deleteAnnouncement(ann.id);
      if (selectedAnn && selectedAnn.id === ann.id) {
        setSelectedAnn(null);
      }
    }
  };

  return (
    <div style={containerStyle}>
      
      {/* Feed Page Header */}
      <div style={headerSectionStyle}>
        <div style={headerTextGroupStyle}>
          <h1 style={titleStyle}>Announcements Board</h1>
          <p style={subtitleStyle}>
            Keep track of active notifications, academic guidance alerts, and social bulletins.
          </p>
        </div>
        
        {canCreate && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingAnnId(null);
              setAnnForm({ title: '', category: 'General', importance: 'normal', content: '' });
              setIsCreateOpen(true);
            }}
            icon={Plus}
          >
            Post Notice
          </Button>
        )}
      </div>

      {/* Filter and Search Card */}
      <Card hoverable={false} padding="md" style={controlsCardStyle}>
        <div style={controlsRowStyle}>
          <div style={searchWrapperStyle}>
            <Search size={18} color="var(--gray-450)" style={searchIconStyle} />
            <input
              type="text"
              placeholder="Search announcements by title or content snippet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchFieldStyle}
            />
          </div>

          <div style={tabsScrollContainerStyle}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...tabButtonStyle,
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--dark-light)',
                    borderColor: isActive ? 'var(--primary)' : 'var(--gray-200)'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Announcements Feed Layout */}
      <div style={feedListStyle}>
        {sortedAnnouncements.length > 0 ? (
          sortedAnnouncements.map((ann) => {
            const isHigh = ann.importance === 'high';
            const { photo, role } = getAuthorDetails(ann.author);
            
            return (
              <Card
                key={ann.id}
                hoverable={true}
                onClick={() => setSelectedAnn(ann)}
                padding="lg"
                style={{
                  ...annCardStyle,
                  borderLeft: isHigh ? '5px solid var(--danger)' : '1px solid var(--gray-200)'
                }}
              >
                <div style={annHeaderStyle}>
                  {/* Category and Importance tag */}
                  <div style={metaGroupStyle}>
                    <Badge variant={isHigh ? 'danger' : 'primary'} style={{ fontSize: '11px' }}>
                      {ann.category}
                    </Badge>
                    {isHigh && (
                      <span style={urgentAlertLabelStyle}>
                        <AlertTriangle size={13} /> URGENT
                      </span>
                    )}
                  </div>

                  {/* Actions (Edit/Delete/WhatsApp) */}
                  <div style={feedActionsStyle}>
                    <button
                      onClick={(e) => handleShareWhatsApp(e, ann)}
                      style={{ ...actionIconButtonStyle, color: '#16a34a' }}
                      title="Share to WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </button>

                    {canEditDelete && (
                      <>
                        <button
                          onClick={(e) => handleOpenEdit(e, ann)}
                          style={{ ...actionIconButtonStyle, color: 'var(--primary)' }}
                          title="Edit Notice"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, ann)}
                          style={{ ...actionIconButtonStyle, color: 'var(--danger)' }}
                          title="Delete Notice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 style={{ ...annTitleStyle, color: isHigh ? 'var(--danger)' : 'var(--dark)' }}>
                  {ann.title}
                </h3>
                
                <p style={annContentSnippetStyle}>{ann.content.slice(0, 220)}...</p>

                <hr style={dividerStyle} />

                {/* Author Block */}
                <div style={authorFooterRowStyle}>
                  <div style={authorDetailsStyle}>
                    <Avatar src={photo} name={ann.author} size="sm" isCommittee={role === 'government' || role === 'admin'} />
                    <div style={authorTextContainerStyle}>
                      <span style={authorNameStyle}>{ann.author}</span>
                      <span style={authorTitleStyle}>Elected Committee Officer</span>
                    </div>
                  </div>

                  <div style={dateBoxStyle}>
                    <Calendar size={13} color="var(--gray-450)" />
                    <span>{ann.date}</span>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div style={emptyBoxStyle}>No bulletins found matching your filters.</div>
        )}
      </div>

      {/* Focus Modal View */}
      <Modal
        isOpen={!!selectedAnn}
        onClose={() => setSelectedAnn(null)}
        title={selectedAnn?.title || ''}
        footer={
          <div style={modalFooterRowStyle}>
            <Button
              variant="outline"
              onClick={(e) => handleShareWhatsApp(e, selectedAnn)}
              icon={MessageCircle}
              style={{ color: '#16a34a', borderColor: '#16a34a' }}
            >
              Share to WhatsApp
            </Button>
            
            {canEditDelete && selectedAnn && (
              <>
                <Button variant="outline" onClick={(e) => handleOpenEdit(e, selectedAnn)}>
                  Edit notice
                </Button>
                <Button variant="danger" onClick={(e) => handleDelete(e, selectedAnn)}>
                  Delete notice
                </Button>
              </>
            )}
            
            <Button onClick={() => setSelectedAnn(null)}>Close Notice</Button>
          </div>
        }
      >
        {selectedAnn && (
          <div style={modalBodyStyle}>
            <div style={modalMetaRowStyle}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge variant={selectedAnn.importance === 'high' ? 'danger' : 'primary'}>
                  {selectedAnn.category}
                </Badge>
                {selectedAnn.importance === 'high' && <Badge variant="danger">HIGH IMPORTANCE</Badge>}
              </div>
              <span style={modalDateStyle}>Date: <strong>{selectedAnn.date}</strong></span>
            </div>

            <hr style={modalDividerStyle} />

            <p style={modalContentStyle}>{selectedAnn.content}</p>

            <hr style={modalDividerStyle} />

            {/* Author details drawer segment */}
            <div style={modalAuthorBlockStyle}>
              <Avatar
                src={getAuthorDetails(selectedAnn.author).photo}
                name={selectedAnn.author}
                size="md"
                isCommittee={true}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={modalAuthorLabelStyle}>Author and Coordinator</span>
                <span style={modalAuthorNameStyle}>{selectedAnn.author}</span>
                <span style={modalAuthorDescStyle}>Official SSA Executive Cabinet Officer</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingAnnId(null);
        }}
        title={editingAnnId ? 'Edit Announcement Bulletin' : 'Broadcast New Announcement'}
      >
        <form onSubmit={handleFormSubmit} style={formStyle}>
          {errorMsg && <span style={errorTextStyle}>{errorMsg}</span>}

          <div style={formGridRowStyle}>
            <Input
              label="Bulletin Title"
              placeholder="e.g. Futsal practice rescheduled"
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              required
            />

            <div style={formSubGridRowStyle}>
              <Select
                label="Bulletin Category"
                value={annForm.category}
                onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                options={['General', 'Academic', 'Social', 'Financial']}
                required
              />
              <Select
                label="Importance Level"
                value={annForm.importance}
                onChange={(e) => setAnnForm({ ...annForm, importance: e.target.value })}
                options={[
                  { value: 'normal', label: 'Normal notice' },
                  { value: 'high', label: 'Urgent [High priority]' }
                ]}
                required
              />
            </div>
          </div>

          <Input
            label="Announcement Contents"
            type="textarea"
            placeholder="Write full notice description details here..."
            value={annForm.content}
            onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
            rows={6}
            required
          />

          <div style={formFooterStyle}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingAnnId(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingAnnId ? 'Update Notice' : 'Broadcast Bulletin'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles Definitions
───────────────────────────────────────────── */
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)',
  animation: 'fade-in 0.3s ease'
};

const headerSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap',
  textAlign: 'left'
};

const headerTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const titleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '26px',
  fontWeight: '800',
  color: 'var(--dark)'
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'var(--gray-500)',
  lineHeight: '1.5',
  maxWidth: '640px'
};

/* Filter controls */
const controlsCardStyle = {
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)'
};

const controlsRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const searchWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const searchIconStyle = {
  position: 'absolute',
  left: '14px'
};

const searchFieldStyle = {
  width: '100%',
  padding: '12px 16px 12px 42px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--dark)',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const tabsScrollContainerStyle = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  paddingBottom: '2px',
  width: '100%'
};

const tabButtonStyle = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease'
};

/* Feed Cards list */
const feedListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const annCardStyle = {
  backgroundColor: '#fff',
  textAlign: 'left',
  transition: 'all 0.25s ease'
};

const annHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px'
};

const metaGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const urgentAlertLabelStyle = {
  fontSize: '10.5px',
  fontWeight: '800',
  color: 'var(--danger)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  letterSpacing: '0.04em'
};

const feedActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const actionIconButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--gray-50)',
  transition: 'all 0.2s ease'
};

const annTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '800',
  lineHeight: 1.3,
  marginBottom: '8px'
};

const annContentSnippetStyle = {
  fontSize: '13.5px',
  color: 'var(--dark-light)',
  lineHeight: 1.5
};

const dividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-100)',
  margin: '14px 0'
};

const authorFooterRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px'
};

const authorDetailsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const authorTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const authorNameStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const authorTitleStyle = {
  fontSize: '10px',
  color: 'var(--gray-450)',
  fontWeight: '550'
};

const dateBoxStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: 'var(--gray-450)',
  fontWeight: '500'
};

const emptyBoxStyle = {
  padding: '48px',
  textAlign: 'center',
  color: 'var(--gray-450)',
  border: '1.5px dashed var(--gray-200)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '500'
};

/* Modal View */
const modalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const modalMetaRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px'
};

const modalDateStyle = {
  fontSize: '12px',
  color: 'var(--gray-500)'
};

const modalDividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '16px 0'
};

const modalContentStyle = {
  fontSize: '14.5px',
  lineHeight: 1.65,
  color: 'var(--dark-light)',
  whiteSpace: 'pre-line'
};

const modalAuthorBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: 'var(--gray-5',
  border: '1.5px solid var(--gray-150)',
  borderRadius: '12px',
  padding: '12px 16px',
  marginTop: '12px'
};

const modalAuthorLabelStyle = {
  fontSize: '9.5px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const modalAuthorNameStyle = {
  fontSize: '13.5px',
  fontWeight: '750',
  color: 'var(--dark)',
  marginTop: '1px'
};

const modalAuthorDescStyle = {
  fontSize: '11px',
  color: 'var(--gray-450)',
  marginTop: '1px'
};

const modalFooterRowStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  width: '100%'
};

/* Form Modal */
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  textAlign: 'left'
};

const formGridRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const formSubGridRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const formFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '12px'
};

const errorTextStyle = {
  fontSize: '12.5px',
  color: 'var(--danger)',
  fontWeight: '650',
  backgroundColor: 'var(--danger-light)',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  lineHeight: 1.4
};

/* Style Injections */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    input[style*="searchFieldStyle"]:focus {
      border-color: var(--primary) !important;
      background-color: #fff !important;
      box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1) !important;
    }
    button[style*="actionIconButtonStyle"]:hover {
      background-color: var(--gray-200) !important;
      transform: scale(1.05) !important;
    }
    @media (max-width: 768px) {
      div[style*="formSubGridRowStyle"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Announcements;
