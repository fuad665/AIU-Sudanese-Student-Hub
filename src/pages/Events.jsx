import React, { useContext, useState, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  Share2,
  MessageCircle,
  Download,
  QrCode,
  Ticket,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

/* ─────────────────────────────────────────────
   Helper: Event Pass Component (rendered into DOM for PDF capture)
───────────────────────────────────────────── */
const EventPass = React.forwardRef(({ user, event }, ref) => {
  const qrData = encodeURIComponent(
    `SSA-PASS | ${user?.name} | ID:${user?.studentId} | Event:${event?.title} | Date:${event?.date}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&color=0F766E&bgcolor=ffffff`;

  return (
    <div ref={ref} style={passContainerStyle}>
      {/* Pass Header Strip */}
      <div style={passHeaderStyle}>
        <div style={passHeaderContentStyle}>
          <div style={passLogoAreaStyle}>
            <div style={passLogoCircleStyle}>SSA</div>
            <div>
              <div style={passOrgNameStyle}>Sudanese Student Association</div>
              <div style={passUniversityNameStyle}>Albukhary International University</div>
            </div>
          </div>
          <div style={passTicketLabelStyle}>EVENT PASS</div>
        </div>
        <div style={passGoldBarStyle} />
      </div>

      {/* Pass Body */}
      <div style={passBodyStyle}>
        {/* Left: Student Details */}
        <div style={passStudentSectionStyle}>
          <div style={passPhotoCircleStyle}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={passStudentDetailsStyle}>
            <div style={passStudentNameStyle}>{user?.name}</div>
            <div style={passStudentIdStyle}>Matric No. {user?.studentId}</div>
            <div style={passStudentRoleStyle}>{user?.role === 'admin' ? 'Administrator' : user?.role === 'government' ? 'Government Member' : 'Student Member'}</div>
          </div>
        </div>

        {/* Divider perforated line */}
        <div style={passDividerStyle}>
          <div style={passCircleLeftStyle} />
          <div style={passDashedLineStyle} />
          <div style={passCircleRightStyle} />
        </div>

        {/* Right: Event Details */}
        <div style={passEventSectionStyle}>
          <div style={passEventNameStyle}>{event?.title}</div>

          <div style={passEventDetailsRowStyle}>
            <div style={passEventDetailItemStyle}>
              <span style={passDetailLabelStyle}>DATE</span>
              <span style={passDetailValueStyle}>{event?.date}</span>
            </div>
            <div style={passEventDetailItemStyle}>
              <span style={passDetailLabelStyle}>TIME</span>
              <span style={passDetailValueStyle}>{event?.time}</span>
            </div>
            <div style={passEventDetailItemStyle}>
              <span style={passDetailLabelStyle}>VENUE</span>
              <span style={passDetailValueStyle}>{event?.location}</span>
            </div>
            <div style={passEventDetailItemStyle}>
              <span style={passDetailLabelStyle}>CATEGORY</span>
              <span style={{ ...passDetailValueStyle, textTransform: 'capitalize' }}>{event?.category}</span>
            </div>
          </div>
        </div>

        {/* QR Section */}
        <div style={passQrSectionStyle}>
          <img
            src={qrUrl}
            alt="QR Code"
            width={110}
            height={110}
            style={passQrImageStyle}
            crossOrigin="anonymous"
          />
          <div style={passQrLabelStyle}>SCAN TO VERIFY</div>
          <div style={passQrSubLabelStyle}>SSA Entry Pass</div>
        </div>
      </div>

      {/* Pass Footer */}
      <div style={passFooterStyle}>
        <span>This pass is non-transferable and valid only for the registered student.</span>
        <span style={passFooterIdStyle}>#{event?.id?.toUpperCase()}-{user?.studentId}</span>
      </div>
    </div>
  );
});

EventPass.displayName = 'EventPass';

/* ─────────────────────────────────────────────
   Main Events Component
───────────────────────────────────────────── */
const Events = () => {
  const { events, currentUser, rsvpEvent } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [passEvent, setPassEvent] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const passRef = useRef(null);

  const categories = ['All', 'cultural', 'sports', 'academic', 'charity'];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' ? true : ev.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getCategoryVariant = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'cultural': return 'success';
      case 'sports': return 'warning';
      case 'academic': return 'primary';
      case 'charity': return 'info';
      default: return 'primary';
    }
  };

  // WhatsApp Share for event
  const handleShareWhatsApp = (ev) => {
    const text = `🎉 *SSA Event: ${ev.title}*\n\n📅 Date: ${ev.date}\n⏰ Time: ${ev.time}\n📍 Venue: ${ev.location}\n\n${ev.description.slice(0, 200)}...\n\nRSVP on the Sudanese Student Hub (AIU)!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Download Event Pass as PDF
  const handleDownloadPass = useCallback(async () => {
    if (!passRef.current || !passEvent) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Wait a tick to ensure QR image is loaded
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(passRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`SSA-Event-Pass-${passEvent.title.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Pass download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [passEvent]);

  const handleRsvp = (ev) => {
    rsvpEvent(ev.id);
    // If they just RSVPd (weren't already), open the pass modal
    if (!ev.rsvps.includes(currentUser?.id)) {
      setPassEvent(ev);
      setSelectedEvent(null);
    }
  };

  return (
    <div style={containerStyle}>

      {/* Page Header */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={pageTitleStyle}>Events & Programs</h1>
          <p style={pageSubtitleStyle}>
            Discover upcoming social, academic, sports, and cultural events organized by the SSA.
          </p>
        </div>
      </div>

      {/* Search + Category Filter */}
      <Card hoverable={false} padding="md" style={controlsCardStyle}>
        <div style={controlsRowStyle}>
          <div style={searchWrapperStyle}>
            <Search size={17} color="var(--gray-450)" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              placeholder="Search events by title, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInputStyle}
            />
            {search && (
              <button onClick={() => setSearch('')} style={clearBtnStyle}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={categoryTabsStyle}>
            {categories.map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    ...tabBtnStyle,
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--dark-light)',
                    borderColor: isActive ? 'var(--primary)' : 'var(--gray-200)'
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      <div style={eventsGridStyle}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => {
            const hasRsvpd = ev.rsvps.includes(currentUser?.id);
            const totalRsvps = ev.rsvps.length;
            const isFull = totalRsvps >= ev.capacity;
            const pct = Math.min(Math.round((totalRsvps / ev.capacity) * 100), 100);

            return (
              <Card key={ev.id} hoverable={false} padding="none" style={eventCardStyle}>
                {/* Banner Image */}
                <div style={imageWrapperStyle} onClick={() => setSelectedEvent(ev)}>
                  <img src={ev.image} alt={ev.title} style={eventImageStyle} />
                  <div style={imageFadeStyle} />
                  <Badge variant={getCategoryVariant(ev.category)} style={imageBadgeStyle}>
                    {ev.category}
                  </Badge>
                  {hasRsvpd && (
                    <div style={rsvpdStampStyle}>
                      <CheckCircle2 size={14} />
                      RSVP'd
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={cardBodyStyle} onClick={() => setSelectedEvent(ev)}>
                  <h3 style={eventTitleStyle}>{ev.title}</h3>
                  <p style={eventDescStyle}>{ev.description.slice(0, 100)}...</p>

                  <div style={detailsRowStyle}>
                    <div style={detailItemStyle}>
                      <Calendar size={13} color="var(--primary)" />
                      <span>{ev.date}</span>
                    </div>
                    <div style={detailItemStyle}>
                      <Clock size={13} color="var(--primary)" />
                      <span>{ev.time}</span>
                    </div>
                    <div style={{ ...detailItemStyle, gridColumn: '1 / -1' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.location}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div style={capacityWrapStyle}>
                    <div style={capacityLabelsStyle}>
                      <span style={{ color: isFull ? 'var(--danger)' : 'var(--primary)', fontSize: '11px', fontWeight: '600' }}>
                        {isFull ? '⚡ Full' : `${pct}% filled`}
                      </span>
                      <span style={{ color: 'var(--gray-400)', fontSize: '11px' }}>{totalRsvps}/{ev.capacity} slots</span>
                    </div>
                    <div style={capacityTrackStyle}>
                      <div style={{
                        ...capacityFillStyle,
                        width: `${pct}%`,
                        backgroundColor: isFull ? 'var(--danger)' : 'var(--primary)'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div style={cardFooterStyle}>
                  <Button
                    variant={hasRsvpd ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isFull && !hasRsvpd}
                    onClick={() => handleRsvp(ev)}
                    style={{ flexGrow: 1 }}
                  >
                    {hasRsvpd ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} /> RSVP Confirmed
                      </span>
                    ) : isFull ? 'Event at Capacity' : 'RSVP for Event'}
                  </Button>

                  {hasRsvpd && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPassEvent(ev)}
                      style={{ padding: '8px 12px' }}
                      title="View Event Pass"
                    >
                      <Ticket size={15} />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareWhatsApp(ev)}
                    style={{ padding: '8px 12px', color: '#16a34a', borderColor: '#16a34a' }}
                    title="Share to WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div style={emptyBoxStyle}>No events found matching your search criteria.</div>
        )}
      </div>

      {/* ─── Event Detail Modal ─── */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        footer={
          <div style={modalFooterStyle}>
            <Button
              variant="outline"
              onClick={() => handleShareWhatsApp(selectedEvent)}
              style={{ color: '#16a34a', borderColor: '#16a34a' }}
            >
              <MessageCircle size={14} /> Share via WhatsApp
            </Button>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
            {selectedEvent && (
              <Button
                variant={selectedEvent.rsvps.includes(currentUser?.id) ? 'secondary' : 'primary'}
                disabled={selectedEvent.rsvps.length >= selectedEvent.capacity && !selectedEvent.rsvps.includes(currentUser?.id)}
                onClick={() => handleRsvp(selectedEvent)}
              >
                {selectedEvent.rsvps.includes(currentUser?.id) ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} /> RSVP Confirmed
                  </span>
                ) : 'Confirm RSVP'}
              </Button>
            )}
          </div>
        }
      >
        {selectedEvent && (
          <div style={modalBodyStyle}>
            {/* Banner */}
            <div style={modalBannerStyle}>
              <img src={selectedEvent.image} alt={selectedEvent.title} style={modalBannerImgStyle} />
              <div style={modalBannerFadeStyle} />
              <Badge variant={getCategoryVariant(selectedEvent.category)} style={{ position: 'absolute', top: '14px', left: '14px' }}>
                {selectedEvent.category}
              </Badge>
            </div>

            {/* Schedule Grid */}
            <div style={modalScheduleGridStyle}>
              {[
                { icon: Calendar, label: 'Date', val: selectedEvent.date },
                { icon: Clock, label: 'Time', val: selectedEvent.time },
                { icon: MapPin, label: 'Venue', val: selectedEvent.location },
                { icon: Users, label: 'Capacity', val: `${selectedEvent.rsvps.length} / ${selectedEvent.capacity} attending` }
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} style={modalSchedItemStyle}>
                  <div style={modalSchedIconStyle}>
                    <Icon size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={modalSchedLabelStyle}>{label}</div>
                    <div style={modalSchedValStyle}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            <hr style={hrStyle} />

            <div>
              <h5 style={modalSectionTitleStyle}>Event Description</h5>
              <p style={modalDescStyle}>{selectedEvent.description}</p>
            </div>

            {/* Capacity Progress in modal */}
            <div style={modalCapacityWrapStyle}>
              <div style={capacityLabelsStyle}>
                <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '12px' }}>
                  Attendance: {Math.min(Math.round((selectedEvent.rsvps.length / selectedEvent.capacity) * 100), 100)}% filled
                </span>
                <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>
                  {selectedEvent.rsvps.length} / {selectedEvent.capacity}
                </span>
              </div>
              <div style={{ ...capacityTrackStyle, height: '10px', marginTop: '6px' }}>
                <div style={{
                  ...capacityFillStyle,
                  width: `${Math.min(Math.round((selectedEvent.rsvps.length / selectedEvent.capacity) * 100), 100)}%`
                }} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Event Pass Modal ─── */}
      <Modal
        isOpen={!!passEvent}
        onClose={() => setPassEvent(null)}
        title="Your Event Pass"
        footer={
          <div style={modalFooterStyle}>
            <Button
              variant="outline"
              onClick={() => handleShareWhatsApp(passEvent)}
              style={{ color: '#16a34a', borderColor: '#16a34a' }}
            >
              <MessageCircle size={14} /> Share Event
            </Button>
            <Button variant="outline" onClick={() => setPassEvent(null)}>Close</Button>
            <Button
              variant="secondary"
              loading={isDownloading}
              onClick={handleDownloadPass}
            >
              <Download size={14} /> Download Pass PDF
            </Button>
          </div>
        }
      >
        {passEvent && currentUser && (
          <div>
            <div style={passPreviewWrapStyle}>
              <div style={passSuccessBannerStyle}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span>RSVP confirmed! Your event pass is ready.</span>
              </div>

              {/* The actual pass rendered to DOM for capture */}
              <EventPass ref={passRef} user={currentUser} event={passEvent} />
            </div>

            <p style={passHintStyle}>
              Download your pass as a PDF to present at the venue, or share the event via WhatsApp.
            </p>
          </div>
        )}
      </Modal>

    </div>
  );
};

/* ─────────────────────────────────────────────
   Event Pass Inline Styles
───────────────────────────────────────────── */
const passContainerStyle = {
  width: '680px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  fontFamily: "'Inter', 'Outfit', sans-serif",
  border: '1.5px solid #e5e7eb'
};

const passHeaderStyle = {
  background: 'linear-gradient(135deg, #0c5c56 0%, #0F766E 60%, #147a72 100%)',
  padding: '20px 24px 0 24px'
};

const passHeaderContentStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '16px'
};

const passLogoAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const passLogoCircleStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  border: '2px solid rgba(255,255,255,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: '900',
  fontSize: '14px',
  letterSpacing: '0.05em'
};

const passOrgNameStyle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.02em'
};

const passUniversityNameStyle = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '10px',
  fontWeight: '500',
  marginTop: '1px'
};

const passTicketLabelStyle = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.14em',
  border: '1.5px solid rgba(255,255,255,0.4)',
  padding: '4px 10px',
  borderRadius: '4px'
};

const passGoldBarStyle = {
  height: '4px',
  background: 'linear-gradient(90deg, #D4A017 0%, #f0c040 50%, #D4A017 100%)',
  margin: '0 -24px'
};

const passBodyStyle = {
  display: 'flex',
  gap: '0',
  alignItems: 'stretch',
  minHeight: '160px'
};

const passStudentSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 24px',
  gap: '12px',
  minWidth: '160px',
  backgroundColor: '#fafafa',
  borderRight: '1px dashed #d1d5db'
};

const passPhotoCircleStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0F766E, #0c5c56)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: '800',
  border: '3px solid #D4A017'
};

const passStudentDetailsStyle = {
  textAlign: 'center'
};

const passStudentNameStyle = {
  fontSize: '13px',
  fontWeight: '800',
  color: '#111827',
  lineHeight: 1.2
};

const passStudentIdStyle = {
  fontSize: '10px',
  color: '#6b7280',
  fontFamily: 'monospace',
  marginTop: '3px',
  fontWeight: '600'
};

const passStudentRoleStyle = {
  fontSize: '9px',
  color: '#0F766E',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginTop: '4px',
  backgroundColor: 'rgba(15,118,110,0.08)',
  padding: '2px 8px',
  borderRadius: '4px'
};

const passDividerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative'
};

const passCircleLeftStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  marginTop: '-10px',
  flexShrink: 0
};

const passDashedLineStyle = {
  width: '1px',
  flexGrow: 1,
  borderLeft: '1.5px dashed #d1d5db',
  margin: '4px 0'
};

const passCircleRightStyle = {
  ...passCircleLeftStyle,
  marginBottom: '-10px',
  marginTop: '0'
};

const passEventSectionStyle = {
  flexGrow: 1,
  padding: '20px 20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '12px'
};

const passEventNameStyle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#0F766E',
  lineHeight: 1.2
};

const passEventDetailsRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px 16px'
};

const passEventDetailItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1px'
};

const passDetailLabelStyle = {
  fontSize: '8px',
  fontWeight: '700',
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const passDetailValueStyle = {
  fontSize: '11.5px',
  fontWeight: '650',
  color: '#111827'
};

const passQrSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 20px',
  borderLeft: '1px dashed #d1d5db',
  gap: '6px',
  minWidth: '140px'
};

const passQrImageStyle = {
  borderRadius: '8px',
  border: '2px solid #e5e7eb'
};

const passQrLabelStyle = {
  fontSize: '8px',
  fontWeight: '800',
  color: '#0F766E',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
};

const passQrSubLabelStyle = {
  fontSize: '8px',
  color: '#9ca3af',
  fontWeight: '500'
};

const passFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 24px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  fontSize: '9px',
  color: '#9ca3af',
  fontWeight: '500'
};

const passFooterIdStyle = {
  fontFamily: 'monospace',
  fontWeight: '700',
  color: '#0F766E',
  fontSize: '9px'
};

/* ─────────────────────────────────────────────
   Page Layout Styles
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
  textAlign: 'left'
};

const pageTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '26px',
  fontWeight: '800',
  color: 'var(--dark)'
};

const pageSubtitleStyle = {
  fontSize: '14px',
  color: 'var(--gray-500)',
  marginTop: '6px',
  lineHeight: 1.5
};

const controlsCardStyle = {
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)'
};

const controlsRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
};

const searchWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 40px 12px 42px',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  color: 'var(--dark)',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const clearBtnStyle = {
  position: 'absolute',
  right: '12px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--gray-400)',
  display: 'flex',
  alignItems: 'center'
};

const categoryTabsStyle = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  paddingBottom: '2px'
};

const tabBtnStyle = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease'
};

const eventsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '24px'
};

const eventCardStyle = {
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'hidden',
  border: '1.5px solid var(--gray-200)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease'
};

const imageWrapperStyle = {
  height: '170px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer'
};

const eventImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s ease'
};

const imageFadeStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45))',
  pointerEvents: 'none'
};

const imageBadgeStyle = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  textTransform: 'capitalize'
};

const rsvpdStampStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: 'var(--success)',
  color: '#fff',
  fontSize: '10px',
  fontWeight: '800',
  padding: '3px 8px',
  borderRadius: '20px',
  letterSpacing: '0.04em'
};

const cardBodyStyle = {
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexGrow: 1,
  cursor: 'pointer',
  textAlign: 'left'
};

const eventTitleStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '16px',
  fontWeight: '800',
  color: 'var(--dark)',
  lineHeight: 1.3
};

const eventDescStyle = {
  fontSize: '12.5px',
  color: 'var(--dark-light)',
  lineHeight: 1.45
};

const detailsRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px 12px',
  marginTop: '4px'
};

const detailItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11.5px',
  color: 'var(--gray-500)',
  fontWeight: '550'
};

const capacityWrapStyle = {
  marginTop: '10px'
};

const capacityLabelsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '4px'
};

const capacityTrackStyle = {
  height: '6px',
  backgroundColor: 'var(--gray-150)',
  borderRadius: '999px',
  overflow: 'hidden'
};

const capacityFillStyle = {
  height: '100%',
  borderRadius: '999px',
  backgroundColor: 'var(--primary)',
  transition: 'width 0.5s ease'
};

const cardFooterStyle = {
  padding: '12px 20px 18px 20px',
  borderTop: '1px solid var(--gray-150)',
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
};

const emptyBoxStyle = {
  gridColumn: '1 / -1',
  padding: '48px',
  textAlign: 'center',
  color: 'var(--gray-450)',
  border: '1.5px dashed var(--gray-200)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '500'
};

/* ── Event Detail Modal ── */
const modalFooterStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  width: '100%',
  flexWrap: 'wrap'
};

const modalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  textAlign: 'left'
};

const modalBannerStyle = {
  height: '220px',
  width: '100%',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  position: 'relative',
  marginBottom: '20px'
};

const modalBannerImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const modalBannerFadeStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))'
};

const modalScheduleGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '20px'
};

const modalSchedItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  backgroundColor: 'var(--gray-50)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--gray-150)'
};

const modalSchedIconStyle = {
  backgroundColor: 'var(--primary-light)',
  padding: '8px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const modalSchedLabelStyle = {
  fontSize: '9px',
  color: 'var(--gray-450)',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.06em'
};

const modalSchedValStyle = {
  fontSize: '13px',
  fontWeight: '650',
  color: 'var(--dark)',
  marginTop: '2px'
};

const hrStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '16px 0'
};

const modalSectionTitleStyle = {
  fontSize: '12px',
  fontWeight: '750',
  color: 'var(--dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px'
};

const modalDescStyle = {
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'var(--dark-light)',
  whiteSpace: 'pre-line'
};

const modalCapacityWrapStyle = {
  marginTop: '16px'
};

/* ── Event Pass Modal ── */
const passPreviewWrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  alignItems: 'center'
};

const passSuccessBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'var(--success-light)',
  border: '1.5px solid rgba(16,185,129,0.2)',
  borderRadius: '10px',
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--success)',
  width: '100%'
};

const passHintStyle = {
  fontSize: '12px',
  color: 'var(--gray-450)',
  textAlign: 'center',
  marginTop: '12px',
  lineHeight: 1.4
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    div[style*="eventCardStyle"]:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
      transform: translateY(-2px) !important;
    }
    div[style*="imageWrapperStyle"]:hover img {
      transform: scale(1.04) !important;
    }
    input[style*="searchInputStyle"]:focus {
      border-color: var(--primary) !important;
      background-color: #fff !important;
      box-shadow: 0 0 0 4px rgba(15,118,110,0.08) !important;
    }
    @media (max-width: 900px) {
      div[style*="modalScheduleGridStyle"] {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 600px) {
      div[style*="eventsGridStyle"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Events;
