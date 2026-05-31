// ─────────────────────────────────────────────
//  AppContext  –  Supabase-powered
//  src/context/AppContext.jsx
//
//  All state is fetched from / written to Supabase.
//  Authentication is delegated to Supabase Auth.
// ─────────────────────────────────────────────
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// API service layer
import {
  fetchAllUsers,
  fetchUserByAuthId,
  insertUserProfile,
  updateUserProfile,
  adminUpdateUser,
  deleteUserProfile,
  uploadAvatar,
} from '../api/users';
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement as deleteAnnouncementApi,
} from '../api/announcements';
import {
  fetchEvents,
  createEvent,
  rsvpEvent as rsvpEventApi,
} from '../api/events';
import {
  fetchElections,
  createElection as createElectionApi,
  updateElectionStatus,
  setElectionWinner,
  castVote,
} from '../api/elections';
import { fetchAlumni, submitMentorshipRequest } from '../api/alumni';
import { fetchGovernmentData } from '../api/government';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── Core state ───────────────────────────
  const [currentUser,       setCurrentUser]       = useState(null);
  const [authSession,       setAuthSession]       = useState(null);
  const [users,             setUsers]             = useState([]);
  const [announcements,     setAnnouncements]     = useState([]);
  const [events,            setEvents]            = useState([]);
  const [elections,         setElections]         = useState([]);
  const [alumni,            setAlumni]            = useState([]);
  const [governmentHistory, setGovernmentHistory] = useState({ currentTenure: '', executives: [], history: [] });
  const [toast,             setToast]             = useState(null);
  const [loading,           setLoading]           = useState(true); // global initial load

  // ─── Toast helper ─────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── Initial data load ────────────────────
  // Loads public/authenticated data once we know who the current user is.
  const loadPublicData = useCallback(async (userId = null) => {
    try {
      const [anns, evts, elects, alum, govData, allUsers] = await Promise.all([
        fetchAnnouncements(),
        fetchEvents(userId),
        fetchElections(userId),
        fetchAlumni(),
        fetchGovernmentData(),
        fetchAllUsers(),
      ]);
      setAnnouncements(anns);
      setEvents(evts);
      setElections(elects);
      setAlumni(alum);
      setGovernmentHistory(govData);
      setUsers(allUsers);
    } catch (err) {
      console.error('[SSA] Failed to load public data:', err.message);
    }
  }, []);

  // ─── Auth listener ────────────────────────
  // Runs once on mount and whenever Supabase Auth state changes.
  useEffect(() => {
    let isMounted = true;

    const bootstrap = async (session) => {
      if (isMounted) setAuthSession(session);
      if (session?.user) {
        try {
          const profile = await fetchUserByAuthId(session.user.id);
          if (isMounted) {
            setCurrentUser(profile);
            // Fetch public data in background (do not await to speed up loading)
            loadPublicData(profile.id);
          }
        } catch {
          // Profile not yet created (race condition after signup — handled in register())
          if (isMounted) setCurrentUser(null);
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
          // Fetch public data in background (do not await to speed up loading)
          loadPublicData();
        }
      }
      if (isMounted) setLoading(false);
    };

    // Get the current session synchronously on mount
    supabase.auth.getSession().then(({ data: { session } }) => bootstrap(session));

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => bootstrap(session)
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadPublicData]);

  // ─────────────────────────────────────────
  //  AUTHENTICATION
  // ─────────────────────────────────────────

  /** Sign in with Supabase Auth using email + password */
  const login = async (loginId, password) => {
    // loginId can be email or student ID — resolve email first
    let email = loginId;

    if (!/\S+@\S+\.\S+/.test(loginId)) {
      // Looks like a student ID — look up email from users
      const match = users.find(
        (u) => u.studentId === loginId || u.name.toLowerCase() === loginId.toLowerCase()
      );
      if (!match) {
        showToast('Student ID not found. Please try your email.', 'error');
        return false;
      }
      email = match.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast('Invalid credentials. Please try again.', 'error');
      return false;
    }
    // Auth state listener (onAuthStateChange) will set currentUser automatically
    return true;
  };

  /** Sign out */
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    showToast('Logged out successfully.', 'info');
  };

  /** Register a new student: ONLY create Supabase Auth account */
  const register = async (email, password) => {
    // 1. Create Supabase Auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      showToast(signUpError.message, 'error');
      return false;
    }

    showToast('Registration successful! Please log in.', 'success');
    return true;
  };

  // ─────────────────────────────────────────
  //  PROFILE
  // ─────────────────────────────────────────

  const updateProfile = async (profileData) => {
    if (!currentUser) return false;
    try {
      // Handle photo upload separately if a File object was passed
      let updates = { ...profileData };
      if (profileData.photoFile instanceof File) {
        const url = await uploadAvatar(currentUser.authId, profileData.photoFile);
        updates.photo = url;
        delete updates.photoFile;
      }
      const updated = await updateUserProfile(currentUser.id, updates);
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast('Profile updated successfully!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const completeOnboarding = (profile) => {
    setCurrentUser(profile);
    loadPublicData(profile.id);
  };

  // ─────────────────────────────────────────
  //  ADMIN: USER MANAGEMENT
  // ─────────────────────────────────────────

  const updateUserAdmin = async (userId, updates) => {
    try {
      const updated = await adminUpdateUser(userId, updates);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showToast('User updated successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const approveStudent = async (userId) => {
    await updateUserAdmin(userId, { role: 'member', status: 'active' });
    showToast('Student approved!', 'success');
  };

  const deleteStudent = async (userId) => {
    try {
      await deleteUserProfile(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('Student account removed.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─────────────────────────────────────────
  //  ANNOUNCEMENTS
  // ─────────────────────────────────────────

  const addAnnouncement = async (announcementData) => {
    try {
      const ann = await createAnnouncement({
        ...announcementData,
        authorId:   currentUser?.id,
        authorName: currentUser?.name ?? 'SSA Committee',
      });
      setAnnouncements((prev) => [ann, ...prev]);
      showToast('Announcement posted!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const editAnnouncement = async (annId, updatedData) => {
    try {
      const updated = await updateAnnouncement(annId, updatedData);
      setAnnouncements((prev) => prev.map((a) => (a.id === annId ? updated : a)));
      showToast('Announcement updated!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const deleteAnnouncement = async (annId) => {
    try {
      await deleteAnnouncementApi(annId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
      showToast('Announcement deleted.', 'info');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────
  //  EVENTS
  // ─────────────────────────────────────────

  const addEvent = async (eventData) => {
    try {
      const ev = await createEvent(eventData, currentUser?.id);
      setEvents((prev) => [{ ...ev, rsvps: [], rsvpCount: 0 }, ...prev]);
      showToast('Event created!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const rsvpEvent = async (eventId) => {
    if (!currentUser) {
      showToast('Please log in to RSVP!', 'error');
      return false;
    }
    try {
      const newStatus = await rsvpEventApi(eventId, currentUser.id);
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== eventId) return ev;
          const confirmed = newStatus === 'confirmed';
          return {
            ...ev,
            userHasRsvp: confirmed,
            rsvpCount: confirmed ? (ev.rsvpCount ?? 0) + 1 : Math.max(0, (ev.rsvpCount ?? 1) - 1),
            rsvps: confirmed
              ? [...(ev.rsvps ?? []), currentUser.id]
              : (ev.rsvps ?? []).filter((id) => id !== currentUser.id),
          };
        })
      );
      showToast(
        newStatus === 'confirmed' ? 'RSVP confirmed!' : 'RSVP cancelled.',
        newStatus === 'confirmed' ? 'success' : 'info'
      );
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────
  //  ELECTIONS
  // ─────────────────────────────────────────

  const vote = async (electionId, candidateId) => {
    if (!currentUser) {
      showToast('You must be logged in to vote!', 'error');
      return false;
    }
    const election = elections.find((e) => e.id === electionId);
    if (election?.votedUserIds?.includes(currentUser.id)) {
      showToast('You have already voted in this election!', 'warning');
      return false;
    }
    try {
      await castVote(electionId, candidateId, currentUser.id);
      // Optimistic local update
      setElections((prev) =>
        prev.map((e) => {
          if (e.id !== electionId) return e;
          return {
            ...e,
            votedUserIds: [...(e.votedUserIds ?? []), currentUser.id],
            candidates: e.candidates.map((c) =>
              c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
            ),
          };
        })
      );
      showToast('Your vote has been recorded!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const changeElectionStatus = async (electionId, newStatus) => {
    try {
      await updateElectionStatus(electionId, newStatus);

      if (newStatus === 'published') {
        // Determine winner from current state
        const election = elections.find((e) => e.id === electionId);
        if (election) {
          const sorted = [...election.candidates].sort((a, b) => b.votes - a.votes);
          const topCand = sorted[0];
          if (topCand) {
            await setElectionWinner(electionId, topCand.userId ?? null);
            // Promote winner in users
            if (topCand.userId) {
              await adminUpdateUser(topCand.userId, {
                role: 'government',
                status: 'government',
                position: election.position,
              });
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === topCand.userId
                    ? { ...u, role: 'government', status: 'government', position: election.position }
                    : u
                )
              );
            }
            showToast(
              `Results published! ${topCand.name} is the new ${election.position}.`,
              'success'
            );
          }
        }
      } else {
        showToast(`Election status updated to ${newStatus.replace('_', ' ')}.`, 'info');
      }

      // Refresh elections from DB to stay in sync
      const refreshed = await fetchElections(currentUser?.id);
      setElections(refreshed);
      // Also refresh government data if published
      if (newStatus === 'published') {
        const govData = await fetchGovernmentData();
        setGovernmentHistory(govData);
      }
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const createElection = async (electionData) => {
    try {
      await createElectionApi(electionData, currentUser?.id);
      const refreshed = await fetchElections(currentUser?.id);
      setElections(refreshed);
      showToast('Election created!', 'success');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────
  //  CONTEXT VALUE
  // ─────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        // State
        loading,
        currentUser,
        authSession,
        users,
        announcements,
        events,
        elections,
        alumni,
        governmentHistory,
        toast,
        // Auth
        login,
        logout,
        register,
        // Profile
        updateProfile,
        completeOnboarding,
        // Admin
        updateUserAdmin,
        approveStudent,
        deleteStudent,
        // Announcements
        addAnnouncement,
        editAnnouncement,
        deleteAnnouncement,
        // Events
        addEvent,
        rsvpEvent,
        // Elections
        vote,
        changeElectionStatus,
        createElection,
        // Utilities
        showToast,
      }}
    >
      {children}

      {/* Toast Notification */}
      {toast && (
        <div style={toastContainerStyle}>
          <div style={{ ...toastBodyStyle, ...toastTypesStyle[toast.type] }}>
            <div style={toastIconStyle[toast.type]} />
            <span style={{ fontWeight: '500' }}>{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

// ─── Toast Styles ─────────────────────────────
const toastContainerStyle = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  zIndex: 99999,
  animation: 'slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px'
};

const toastBodyStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 20px',
  borderRadius: '12px',
  color: '#ffffff',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease'
};

const toastTypesStyle = {
  success: { backgroundColor: 'rgba(15,118,110,0.95)',  border: '1.5px solid rgba(255,255,255,0.2)' },
  error:   { backgroundColor: 'rgba(239,68,68,0.95)',   border: '1.5px solid rgba(255,255,255,0.2)' },
  warning: { backgroundColor: 'rgba(245,158,11,0.95)',  border: '1.5px solid rgba(255,255,255,0.2)' },
  info:    { backgroundColor: 'rgba(59,130,246,0.95)',  border: '1.5px solid rgba(255,255,255,0.2)' },
};

const toastIconStyle = {
  success: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' },
  error:   { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' },
  warning: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' },
  info:    { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' },
};
