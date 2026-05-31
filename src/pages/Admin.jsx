import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ShieldAlert, UserCheck, Megaphone, CalendarPlus, Vote, Check, X, ShieldX, Plus, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Table, { tdStyle } from '../components/Table';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

const Admin = () => {
  const {
    currentUser,
    users,
    approveStudent,
    deleteStudent,
    updateUserAdmin,
    addAnnouncement,
    addEvent,
    createElection
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('users');

  // Form states
  // 1. Announcements form
  const [annForm, setAnnForm] = useState({ title: '', category: 'General', importance: 'normal', content: '' });
  const [annError, setAnnError] = useState('');
  
  // 2. Events form
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', location: '', capacity: 100, category: 'cultural', description: '', image: '' });
  const [eventError, setEventError] = useState('');

  // 3. Elections form
  const [electForm, setElectForm] = useState({ title: '', description: '', startDate: '', endDate: '', position: 'President' });
  const [candidatesList, setCandidatesList] = useState([{ name: '', major: '', manifesto: '', avatar: '' }]);
  const [electError, setElectError] = useState('');

  // Gate check: Block access if user is not Admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={deniedPageStyle}>
        <Card hoverable={false} padding="lg" style={{ textAlign: 'center', maxWidth: '440px' }}>
          <ShieldX size={64} color="var(--danger)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={deniedTitleStyle}>Access Authorization Denied</h3>
          <p style={deniedDescStyle}>
            This control panel contains restricted administrator operations. Your current account profile does not possess necessary root clearance keys.
          </p>
        </Card>
      </div>
    );
  }

  // Removed pending filter to show all users

  // FORM SUBMISSION HANDLERS
  const handleAnnSubmit = (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      setAnnError('Please fill in all announcement fields.');
      return;
    }

    addAnnouncement(annForm);
    setAnnForm({ title: '', category: 'General', importance: 'normal', content: '' });
    setAnnError('');
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.location || !eventForm.description.trim()) {
      setEventError('Please complete all core event schedules.');
      return;
    }

    addEvent(eventForm);
    setEventForm({ title: '', date: '', time: '', location: '', capacity: 100, category: 'cultural', description: '', image: '' });
    setEventError('');
  };

  // Candidates handlers
  const handleAddCandidateInput = () => {
    setCandidatesList((prev) => [...prev, { name: '', major: '', manifesto: '', avatar: '' }]);
  };

  const handleRemoveCandidateInput = (index) => {
    setCandidatesList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = candidatesList.map((cand, idx) => {
      if (idx === index) {
        return { ...cand, [field]: value };
      }
      return cand;
    });
    setCandidatesList(updated);
  };

  const handleElectSubmit = (e) => {
    e.preventDefault();
    if (!electForm.title.trim() || !electForm.description.trim() || !electForm.endDate) {
      setElectError('Please complete all election descriptors.');
      return;
    }

    if (candidatesList.some((c) => !c.name.trim() || !c.manifesto.trim())) {
      setElectError('All added candidates must have names and manifestos.');
      return;
    }

    const newElectData = {
      ...electForm,
      startDate: new Date().toISOString().split('T')[0],
      candidates: candidatesList.map((c, idx) => {
        const matchUser = users.find(u => u.name.toLowerCase() === c.name.toLowerCase());
        return {
          ...c,
          studentId: matchUser ? matchUser.studentId : `2610${Math.floor(100 + Math.random() * 900)}`,
          id: `cand-${Date.now()}-${idx}`
        };
      })
    };

    createElection(newElectData);
    setElectForm({ title: '', description: '', startDate: '', endDate: '', position: 'President' });
    setCandidatesList([{ name: '', major: '', manifesto: '', avatar: '' }]);
    setElectError('');
  };

  return (
    <div style={containerStyle}>
      {/* Admin Panel Header tabs */}
      <div style={adminTabsHeaderStyle}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'users' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'users' ? '700' : '500'
          }}
        >
          <UserCheck size={16} />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'announcements' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'announcements' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'announcements' ? '700' : '500'
          }}
        >
          <Megaphone size={16} />
          <span>Broadcast Notice</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'events' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'events' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'events' ? '700' : '500'
          }}
        >
          <CalendarPlus size={16} />
          <span>Schedule Program</span>
        </button>

        <button
          onClick={() => setActiveTab('elections')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'elections' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'elections' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'elections' ? '700' : '500'
          }}
        >
          <Vote size={16} />
          <span>Setup Election</span>
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div style={panelBodyStyle}>
        
        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div style={panelContentStyle}>
            <div style={panelTitleBlockStyle}>
              <h3 style={panelTitleStyle}>Directory & Access Management</h3>
              <p style={panelDescStyle}>Change user roles, statuses, assign government positions, and graduate alumni batches.</p>
            </div>

            <Table
              headers={['User', 'Status & Role', 'Position', 'Actions']}
              data={users}
              emptyMessage="No users found."
              renderRow={(u) => (
                <tr key={u.id}>
                  <td style={tdStyle}>
                    <div style={studentColStyle}>
                      <Avatar src={u.photo || u.avatar} name={u.name || u.fullName} size="sm" />
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={studentNameStyle}>{u.name || u.fullName}</span>
                        <span style={studentContactStyle}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select 
                        value={u.status} 
                        onChange={(e) => updateUserAdmin(u.id, { status: e.target.value })}
                        style={{ ...selectFieldStyle, padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="government">Government</option>
                        <option value="alumni">Alumni</option>
                      </select>
                      <select 
                        value={u.role} 
                        onChange={(e) => updateUserAdmin(u.id, { role: e.target.value })}
                        style={{ ...selectFieldStyle, padding: '4px 8px', fontSize: '12px', marginTop: '4px' }}
                      >
                        <option value="pending">Pending Role</option>
                        <option value="member">Member</option>
                        <option value="government">Government Role</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <input 
                      type="text" 
                      placeholder="e.g. President" 
                      value={u.position || ''} 
                      onChange={(e) => updateUserAdmin(u.id, { position: e.target.value })}
                      style={{ ...searchFieldStyle, padding: '6px 8px', fontSize: '12px' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div style={actionsRowStyle}>
                      {u.role === 'pending' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => approveStudent(u.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Check size={14} /> Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteStudent(u.id)}
                        style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}
                      >
                        <X size={14} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        )}

        {/* TAB 2: BROADCAST BULLETIN */}
        {activeTab === 'announcements' && (
          <Card hoverable={false} padding="lg" style={panelCardStyle}>
            <div style={panelTitleBlockStyle}>
              <h3 style={panelTitleStyle}>Broadcast Official Announcement</h3>
              <p style={panelDescStyle}>Transmit bulletins immediately to the student announcements dashboard feed.</p>
            </div>

            <form onSubmit={handleAnnSubmit} style={formStyle}>
              {annError && <span style={errorTextStyle}>{annError}</span>}
              
              <div style={gridRowStyle}>
                <Input
                  label="Bulletin Title"
                  placeholder="e.g. Futsal Registration Open"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  required
                />
                
                <div style={gridRowStyle}>
                  <Select
                    label="Notice Category"
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
                      { value: 'normal', label: 'Normal Bulletin' },
                      { value: 'high', label: 'Urgent [High Importance]' }
                    ]}
                    required
                  />
                </div>
              </div>

              <Input
                label="Announcement Contents"
                type="textarea"
                placeholder="Write full text details here..."
                value={annForm.content}
                onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                rows={6}
                required
              />

              <Button type="submit" variant="primary" style={{ width: 'fit-content', alignSelf: 'flex-end' }}>
                Transmit Bulletin
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 3: SCHEDULE PROGRAM */}
        {activeTab === 'events' && (
          <Card hoverable={false} padding="lg" style={panelCardStyle}>
            <div style={panelTitleBlockStyle}>
              <h3 style={panelTitleStyle}>Schedule Community Event</h3>
              <p style={panelDescStyle}>Schedule upcoming social events, workshops, or activities with automated RSVPs tracking.</p>
            </div>

            <form onSubmit={handleEventSubmit} style={formStyle}>
              {eventError && <span style={errorTextStyle}>{eventError}</span>}

              <div style={gridRowStyle}>
                <Input
                  label="Event Title"
                  placeholder="e.g. Sudanese National Day Celebration"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                />
                <Select
                  label="Event Category"
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  options={['cultural', 'sports', 'academic', 'charity']}
                  required
                />
              </div>

              <div style={gridRowStyle}>
                <Input
                  label="Event Date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
                <Input
                  label="Event Time"
                  placeholder="e.g. 5:00 PM - 9:00 PM"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                />
              </div>

              <div style={gridRowStyle}>
                <Input
                  label="Venue Location"
                  placeholder="e.g. AIU Seminar Room 1"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  required
                />
                <Input
                  label="Max Capacity Limit"
                  type="number"
                  placeholder="e.g. 100"
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                  required
                />
              </div>

              {/* Quick Image Selector mockup helper */}
              <Select
                label="Event Banner Mockup Image"
                value={eventForm.image}
                onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                options={[
                  { value: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', label: 'Cultural Showcase' },
                  { value: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800', label: 'Sports Complex Tournament' },
                  { value: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800', label: 'Academic Seminar / Lecture' },
                  { value: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800', label: 'Voluntary Charity Clean-up' }
                ]}
                placeholder="Choose standard banner mockup"
              />

              <Input
                label="Event Agenda Description"
                type="textarea"
                placeholder="Include agenda descriptions, rules, items provided, etc..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={4}
                required
              />

              <Button type="submit" variant="primary" style={{ width: 'fit-content', alignSelf: 'flex-end' }}>
                Schedule Event
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 4: SETUP ELECTION */}
        {activeTab === 'elections' && (
          <Card hoverable={false} padding="lg" style={panelCardStyle}>
            <div style={panelTitleBlockStyle}>
              <h3 style={panelTitleStyle}>Initialize SSA General Election</h3>
              <p style={panelDescStyle}>Setup upcoming committees or presidential referendums, declare candidates, and invite student body voting.</p>
            </div>

            <form onSubmit={handleElectSubmit} style={formStyle}>
              {electError && <span style={errorTextStyle}>{electError}</span>}

              <div style={gridRowStyle}>
                <Input
                  label="Election Campaign Title"
                  placeholder="e.g. IT Secretary Selection 2026"
                  value={electForm.title}
                  onChange={(e) => setElectForm({ ...electForm, title: e.target.value })}
                  required
                />
                <div style={gridRowStyle}>
                  <Input
                    label="Voting Expiry Date"
                    type="date"
                    value={electForm.endDate}
                    onChange={(e) => setElectForm({ ...electForm, endDate: e.target.value })}
                    required
                  />
                  <Select
                    label="Target Position"
                    value={electForm.position}
                    onChange={(e) => setElectForm({ ...electForm, position: e.target.value })}
                    options={[
                      'President',
                      'Vice President',
                      'Secretary',
                      'Treasurer',
                      'Media Officer',
                      'Academic Affairs',
                      'Sports Coordinator'
                    ]}
                    required
                  />
                </div>
              </div>

              <Input
                label="Election Description & Charter"
                type="textarea"
                placeholder="Define role responsibilities and eligibility..."
                value={electForm.description}
                onChange={(e) => setElectForm({ ...electForm, description: e.target.value })}
                rows={3}
                required
              />

              <hr style={dividerStyle} />

              {/* Dynamic Candidates list management inputs */}
              <div style={candidatesSectionStyle}>
                <div style={candidatesHeaderStyle}>
                  <h4 style={candidatesSectionTitleStyle}>Declared Candidate Profiles</h4>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddCandidateInput}>
                    <Plus size={14} /> Add Candidate
                  </Button>
                </div>

                <div style={candidatesInputsListStyle}>
                  {candidatesList.map((cand, index) => (
                    <div key={index} style={candidateRowFoilStyle}>
                      <div style={candidateInputGridRowStyle}>
                        <Input
                          label="Candidate Name"
                          value={cand.name}
                          onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                          placeholder="e.g. Yasin Ali"
                          required
                        />
                        <Input
                          label="Academic Major"
                          value={cand.major}
                          onChange={(e) => handleCandidateChange(index, 'major', e.target.value)}
                          placeholder="e.g. Economics"
                        />
                        <Select
                          label="Avatar Face Profile"
                          value={cand.avatar}
                          onChange={(e) => handleCandidateChange(index, 'avatar', e.target.value)}
                          options={[
                            { value: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', label: 'Male Portrait 1' },
                            { value: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300', label: 'Male Portrait 2' },
                            { value: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', label: 'Female Portrait 1' },
                            { value: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300', label: 'Female Portrait 2' }
                          ]}
                          placeholder="Choose mock photo"
                        />
                      </div>
                      <Input
                        label="Electoral Manifesto"
                        type="textarea"
                        value={cand.manifesto}
                        onChange={(e) => handleCandidateChange(index, 'manifesto', e.target.value)}
                        placeholder="State candidate manifesto pledges and reforms..."
                        rows={2}
                        required
                      />
                      {candidatesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidateInput(index)}
                          style={removeCandidateButtonStyle}
                          title="Remove Candidate"
                        >
                          <Trash2 size={16} /> Remove Candidate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary" style={{ width: 'fit-content', alignSelf: 'flex-end', marginTop: '12px' }}>
                Launch Election Portal
              </Button>
            </form>
          </Card>
        )}

      </div>
    </div>
  );
};

const deniedPageStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  fontFamily: 'var(--font-body)'
};

const deniedTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const deniedDescStyle = {
  fontSize: '14px',
  color: 'var(--dark-light)',
  marginTop: '8px',
  lineHeight: '1.4'
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: 'var(--font-body)'
};

const adminTabsHeaderStyle = {
  display: 'flex',
  borderBottom: '2.5px solid var(--gray-200)',
  gap: '16px',
  overflowX: 'auto',
  width: '100%'
};

const tabButtonStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '3px solid transparent',
  padding: '12px 14px',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap'
};

const panelBodyStyle = {
  marginTop: '4px'
};

const panelContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const panelCardStyle = {
  backgroundColor: 'var(--light)',
  border: '1.5px solid var(--gray-200)',
  textAlign: 'left'
};

const panelTitleBlockStyle = {
  marginBottom: '20px',
  textAlign: 'left'
};

const panelTitleStyle = {
  fontSize: '16px',
  fontWeight: '750',
  color: 'var(--dark)'
};

const panelDescStyle = {
  fontSize: '13px',
  color: 'var(--gray-500)',
  marginTop: '2px',
  lineHeight: 1.4
};

const studentColStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const studentNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--dark)'
};

const studentContactStyle = {
  fontSize: '11px',
  color: 'var(--gray-400)',
  marginTop: '1px'
};

const facultyNameStyle = {
  fontSize: '13px',
  fontWeight: '550',
  color: 'var(--primary)'
};

const majorNameStyle = {
  fontSize: '11px',
  color: 'var(--dark-light)',
  marginTop: '1px'
};

const matricTextStyle = {
  fontFamily: 'monospace',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--gray-500)'
};

const actionsRowStyle = {
  display: 'flex',
  gap: '8px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const gridRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
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

const dividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '20px 0'
};

const candidatesSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
};

const candidatesHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const candidatesSectionTitleStyle = {
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const candidatesInputsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const candidateRowFoilStyle = {
  padding: '18px',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px dashed var(--gray-300)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const candidateInputGridRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '12px'
};

const removeCandidateButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: 'var(--danger)',
  fontSize: '12px',
  fontWeight: '600',
  width: 'fit-content',
  padding: '4px',
  alignSelf: 'flex-end'
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    button[style*="tabButtonStyle"]:hover {
      color: var(--primary) !important;
    }
    button[style*="removeCandidateButtonStyle"]:hover {
      text-decoration: underline !important;
    }
    @media (max-width: 768px) {
      div[style*="candidateInputGridRowStyle"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      div[style*="gridRowStyle"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Admin;
export { tdStyle };
