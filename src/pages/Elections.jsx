import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Vote,
  Users,
  Calendar,
  Award,
  CheckCircle,
  BarChart3,
  PieChart,
  HelpCircle,
  Lock,
  Unlock,
  Play,
  Square,
  Volume2,
  RefreshCw,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

/* ─────────────────────────────────────────────
   Premium SVG Pie Chart Component
───────────────────────────────────────────── */
const SvgPieChart = ({ candidates }) => {
  const total = useMemo(() => {
    return candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
  }, [candidates]);

  // Distinct premium colors for segments
  const colors = ['#0F766E', '#D4A017', '#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  if (total === 0) {
    return (
      <div style={chartWrapperStyle}>
        <svg width="130" height="130" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--gray-200)" strokeWidth="4.2" />
        </svg>
        <div style={noVotesOverlayStyle}>No votes</div>
      </div>
    );
  }

  return (
    <div style={chartWrapperStyle}>
      <svg width="130" height="130" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        {candidates.map((cand, idx) => {
          const percent = ((cand.votes || 0) / total) * 100;
          if (percent === 0) return null;
          
          const accumulatedPercent = candidates
            .slice(0, idx)
            .reduce((sum, c) => sum + (((c.votes || 0) / total) * 100), 0);
            
          const strokeDasharray = `${percent} ${100 - percent}`;
          const strokeDashoffset = 100 - accumulatedPercent + 25; // 25 offset to align to top (rotate -90deg)

          return (
            <circle
              key={cand.id}
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke={colors[idx % colors.length]}
              strokeWidth="4.2"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Elections Component
───────────────────────────────────────────── */
const Elections = () => {
  const { elections, currentUser, vote, changeElectionStatus } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('voting'); // 'candidates' | 'voting' | 'results'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votingElectionId, setVotingElectionId] = useState(null);
  const [votingLoading, setVotingLoading] = useState(false);

  // Filter lists based on status
  const votingElections = useMemo(() => {
    // Show active and upcoming/ended in voting tab for clarity
    return elections.filter((e) => e.status === 'active' || e.status === 'not_started' || e.status === 'ended');
  }, [elections]);

  const resultsElections = useMemo(() => {
    // Show ended and published in results tab
    return elections.filter((e) => e.status === 'ended' || e.status === 'published');
  }, [elections]);

  // Handle actual vote submission
  const handleCastBallot = (electionId, candidateId) => {
    setVotingLoading(true);
    // Add brief UX delay
    setTimeout(() => {
      vote(electionId, candidateId);
      setVotingLoading(false);
      setSelectedCandidate(null);
      setVotingElectionId(null);
    }, 1000);
  };

  // Percent utility
  const calculatePercent = (votes, total) => {
    if (!total || total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  // Theme colors helper for candidates in pie chart legend
  const legendColors = ['#0F766E', '#D4A017', '#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div style={pageContainerStyle}>
      {/* Page Header */}
      <div style={headerSectionStyle}>
        <div style={headerTextGroupStyle}>
          <h1 style={titleStyle}>SSA Elections Portal</h1>
          <p style={subtitleStyle}>
            Participate in the democratic process to shape the Sudanese Student Association cabinet at AIU.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={tabsHeaderStyle}>
        <button
          onClick={() => setActiveTab('candidates')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'candidates' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'candidates' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'candidates' ? '700' : '500'
          }}
        >
          <Users size={16} />
          <span>Candidates</span>
        </button>

        <button
          onClick={() => setActiveTab('voting')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'voting' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'voting' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'voting' ? '700' : '500'
          }}
        >
          <Vote size={16} />
          <span>Active Voting</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          style={{
            ...tabButtonStyle,
            borderBottomColor: activeTab === 'results' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'results' ? 'var(--primary)' : 'var(--gray-500)',
            fontWeight: activeTab === 'results' ? '700' : '500'
          }}
        >
          <BarChart3 size={16} />
          <span>Election Results</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div style={panelBodyStyle}>
        
        {/* TAB 1: CANDIDATES PANEL */}
        {activeTab === 'candidates' && (
          <div style={tabContentStyle}>
            <div style={panelIntroStyle}>
              <h3 style={panelTitleStyle}>Declared Candidate Profiles</h3>
              <p style={panelDescStyle}>View candidate rosters, student profiles, and campaign manifesto pledges for each portfolio.</p>
            </div>

            {elections.map((elect) => (
              <div key={elect.id} style={electionGroupStyle}>
                <div style={groupHeaderStyle}>
                  <h4 style={groupTitleStyle}>{elect.title}</h4>
                  <Badge variant={
                    elect.status === 'active' ? 'success' :
                    elect.status === 'published' ? 'info' :
                    elect.status === 'ended' ? 'danger' : 'warning'
                  }>
                    {elect.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div style={candidatesGridStyle}>
                  {elect.candidates.map((cand) => (
                    <Card key={cand.id} hoverable={true} padding="lg" style={candCardStyle}>
                      <div style={candProfileHeaderStyle}>
                        <Avatar src={cand.avatar} name={cand.name} size="md" />
                        <div style={candTitleBlockStyle}>
                          <h5 style={candNameStyle}>{cand.name}</h5>
                          <span style={candIdStyle}>Matric: {cand.studentId || 'N/A'}</span>
                        </div>
                      </div>

                      <hr style={dividerStyle} />

                      <div style={candDetailsListStyle}>
                        <div style={detailRowStyle}>
                          <span style={detailLabelStyle}>Major</span>
                          <span style={detailValStyle}>{cand.major}</span>
                        </div>
                        <div style={detailRowStyle}>
                          <span style={detailLabelStyle}>Position Applied</span>
                          <span style={positionBadgeStyle}>{elect.position}</span>
                        </div>
                      </div>

                      <hr style={dividerStyle} />

                      <div style={manifestoBoxStyle}>
                        <span style={manifestoLabelStyle}>Manifesto Pledges</span>
                        <p style={manifestoTextStyle}>"{cand.manifesto}"</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: ACTIVE VOTING PANEL */}
        {activeTab === 'voting' && (
          <div style={tabContentStyle}>
            <div style={panelIntroStyle}>
              <h3 style={panelTitleStyle}>Cast Your Votes</h3>
              <p style={panelDescStyle}>You are eligible to cast exactly one ballot per position. Duplications are strictly prevented by the system.</p>
            </div>

            {votingElections.length > 0 ? (
              <div style={votingStackStyle}>
                {votingElections.map((elect) => {
                  const hasVoted = elect.votedUserIds.includes(currentUser?.id);
                  const isNotStarted = elect.status === 'not_started';
                  const isEnded = elect.status === 'ended';

                  return (
                    <Card key={elect.id} hoverable={false} padding="lg" style={votingCardStyle}>
                      {/* Card status banner */}
                      <div style={cardBannerRowStyle}>
                        <div>
                          <h4 style={electTitleStyle}>{elect.title}</h4>
                          <span style={positionSubStyle}>Role Portfolio: <strong>{elect.position}</strong></span>
                        </div>
                        <Badge variant={
                          elect.status === 'active' ? 'success' :
                          elect.status === 'ended' ? 'danger' : 'warning'
                        }>
                          {elect.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <p style={electDescStyle}>{elect.description}</p>

                      <hr style={dividerStyle} />

                      {/* Display content depending on voting state */}
                      {isNotStarted ? (
                        <div style={voteStatePanelStyle}>
                          <Lock size={20} color="var(--warning)" />
                          <span style={voteStateTextStyle}>Voting session has not started yet. Pre-campaign lists are live.</span>
                        </div>
                      ) : isEnded ? (
                        <div style={voteStatePanelStyle}>
                          <Lock size={20} color="var(--danger)" />
                          <span style={voteStateTextStyle}>Voting session for this position has closed. Awaiting results publication.</span>
                        </div>
                      ) : hasVoted ? (
                        <div style={voteStatePanelStyleSuccess}>
                          <CheckCircle size={20} color="var(--success)" />
                          <span style={voteStateTextStyleSuccess}>Your ballot for this position has been cast successfully. Thank you!</span>
                        </div>
                      ) : (
                        <div style={actionVoteBlockStyle}>
                          <span style={voteActionTitleStyle}>Choose your candidate for {elect.position}:</span>
                          <div style={votingOptionsGridStyle}>
                            {elect.candidates.map((cand) => (
                              <div key={cand.id} style={voteCandidateFoilStyle}>
                                <Avatar src={cand.avatar} name={cand.name} size="md" />
                                <span style={voteCandNameStyle}>{cand.name}</span>
                                <span style={voteCandMajorStyle}>{cand.major}</span>
                                
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCandidate(cand);
                                    setVotingElectionId(elect.id);
                                  }}
                                  style={{ marginTop: '12px' }}
                                >
                                  Vote for {cand.name.split(' ')[0]}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin States Controls Panel */}
                      {currentUser?.role === 'admin' && (
                        <div style={adminControlPanelStyle}>
                          <span style={adminCtrlLabelStyle}>Admin Control Panel:</span>
                          <div style={adminButtonsRowStyle}>
                            <button
                              onClick={() => changeElectionStatus(elect.id, 'active')}
                              style={{ ...adminBtnStyle, backgroundColor: elect.status === 'active' ? 'var(--primary-light)' : '#fff' }}
                            >
                              <Play size={12} /> Start Session
                            </button>
                            <button
                              onClick={() => changeElectionStatus(elect.id, 'ended')}
                              style={{ ...adminBtnStyle, backgroundColor: elect.status === 'ended' ? 'var(--danger-light)' : '#fff' }}
                            >
                              <Square size={12} /> End Session
                            </button>
                            <button
                              onClick={() => changeElectionStatus(elect.id, 'published')}
                              style={adminPublishBtnStyle}
                            >
                              <Volume2 size={12} /> Publish Results
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div style={emptyBoxStyle}>No voting sessions are currently initialized.</div>
            )}
          </div>
        )}

        {/* TAB 3: RESULTS PANEL */}
        {activeTab === 'results' && (
          <div style={tabContentStyle}>
            <div style={panelIntroStyle}>
              <h3 style={panelTitleStyle}>Results Tally Board</h3>
              <p style={panelDescStyle}>Check live tallies, segments analytics, and newly elected cabinet officers of the association.</p>
            </div>

            {resultsElections.length > 0 ? (
              <div style={votingStackStyle}>
                {resultsElections.map((elect) => {
                  const totalVotes = elect.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
                  const isPublished = elect.status === 'published';
                  const winner = elect.winner;

                  return (
                    <Card key={elect.id} hoverable={false} padding="lg" style={votingCardStyle}>
                      <div style={cardBannerRowStyle}>
                        <div>
                          <h4 style={electTitleStyle}>{elect.title}</h4>
                          <span style={positionSubStyle}>Role Portfolio: <strong>{elect.position}</strong></span>
                        </div>
                        <Badge variant={isPublished ? 'info' : 'danger'}>
                          {isPublished ? 'RESULTS PUBLISHED' : 'VOTING ENDED'}
                        </Badge>
                      </div>

                      <hr style={dividerStyle} />

                      {/* If results are NOT published yet */}
                      {!isPublished ? (
                        <div style={resultsPendingStyle}>
                          <Lock size={24} color="var(--gray-400)" />
                          <h5 style={resultsPendingTitleStyle}>Results Pending Publication</h5>
                          <p style={resultsPendingSubStyle}>
                            Voting has officially closed. The Administrator is validating the ballot counts. Results will be visible soon.
                          </p>

                          {/* Admin publish controls */}
                          {currentUser?.role === 'admin' && (
                            <Button
                              variant="secondary"
                              onClick={() => changeElectionStatus(elect.id, 'published')}
                              icon={Volume2}
                              style={{ marginTop: '16px' }}
                            >
                              Publish Cabinet Results Now
                            </Button>
                          )}
                        </div>
                      ) : (
                        /* Results and Winners Block */
                        <div style={resultsActiveBlockStyle}>
                          {/* Winner Showcase banner */}
                          {winner && (
                            <div style={winnerCardStyle}>
                              <div style={govCardHeaderGlowStyle} />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Avatar src={winner.avatar} name={winner.name} size="md" isCommittee={true} />
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                  <span style={winnerHeadingStyle}>Elected Officer</span>
                                  <h4 style={winnerOfficerNameStyle}>{winner.name}</h4>
                                  <span style={winnerOfficerMajorStyle}>{winner.major} · ID: {winner.studentId}</span>
                                </div>
                              </div>
                              <div style={winnerBadgeContainerStyle}>
                                <Badge role="government" style={{ padding: '4px 10px' }}>Elected {elect.position}</Badge>
                              </div>
                            </div>
                          )}

                          {/* Charts Grid */}
                          <div style={chartsGridStyle}>
                            {/* 1. Bar Chart Tally List */}
                            <div style={chartSectionStyle}>
                              <h5 style={chartHeadingStyle}><BarChart3 size={15} /> Bar Chart Votes Tally</h5>
                              <div style={barListContainerStyle}>
                                {elect.candidates.map((cand, idx) => {
                                  const pct = calculatePercent(cand.votes, totalVotes);
                                  const isWinner = winner && cand.studentId === winner.studentId;
                                  return (
                                    <div key={cand.id} style={barItemStyle}>
                                      <div style={barMetaRowStyle}>
                                        <span style={{ fontSize: '13px', fontWeight: isWinner ? '700' : '500', color: 'var(--dark)' }}>
                                          {cand.name} {isWinner && '👑'}
                                        </span>
                                        <span style={barVotesTextStyle}>{cand.votes} votes ({pct}%)</span>
                                      </div>
                                      <div style={barTrackStyle}>
                                        <div
                                          style={{
                                            ...barFillStyle,
                                            width: `${pct}%`,
                                            backgroundColor: legendColors[idx % legendColors.length]
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 2. Svg Pie Chart */}
                            <div style={chartSectionStyle}>
                              <h5 style={chartHeadingStyle}><PieChart size={15} /> Pie Chart Distribution</h5>
                              <div style={pieContainerStyle}>
                                <SvgPieChart candidates={elect.candidates} />
                                <div style={pieLegendsStyle}>
                                  {elect.candidates.map((cand, idx) => {
                                    const pct = calculatePercent(cand.votes, totalVotes);
                                    return (
                                      <div key={cand.id} style={legendRowStyle}>
                                        <div style={{ ...legendColorDotStyle, backgroundColor: legendColors[idx % legendColors.length] }} />
                                        <span style={legendLabelStyle}>{cand.name.split(' ')[0]} ({pct}%)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div style={resultsTotalRowStyle}>
                            <TrendingUp size={14} />
                            <span>Total Cast Ballots: <strong>{totalVotes}</strong> votes</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div style={emptyBoxStyle}>No completed or ended elections are available.</div>
            )}
          </div>
        )}

      </div>

      {/* Cast Ballot Confirmation Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => {
          setSelectedCandidate(null);
          setVotingElectionId(null);
        }}
        title="Confirm Your Vote"
        footer={
          <div style={modalFooterStyle}>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCandidate(null);
                setVotingElectionId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              loading={votingLoading}
              onClick={() => handleCastBallot(votingElectionId, selectedCandidate.id)}
            >
              Confirm Ballot
            </Button>
          </div>
        }
      >
        {selectedCandidate && (
          <div style={modalBodyStyle}>
            <div style={modalCandidateHeaderStyle}>
              <Avatar src={selectedCandidate.avatar} name={selectedCandidate.name} size="lg" />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <h4 style={modalCandNameStyle}>{selectedCandidate.name}</h4>
                <span style={modalCandMajorStyle}>{selectedCandidate.major} · Matric: {selectedCandidate.studentId}</span>
              </div>
            </div>

            <hr style={modalDividerStyle} />

            <div style={modalManifestoSectionStyle}>
              <span style={modalManifestoHeadingStyle}>Electoral Manifesto Statement:</span>
              <p style={modalManifestoTextStyle}>"{selectedCandidate.manifesto}"</p>
            </div>

            <div style={modalCautionBoxStyle}>
              <HelpCircle size={18} />
              <span><strong>Double check:</strong> Once cast, your ballot is locked in and cannot be edited.</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Styles Definitions
───────────────────────────────────────────── */
const pageContainerStyle = {
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

/* Tabs */
const tabsHeaderStyle = {
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

const tabContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const panelIntroStyle = {
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

/* Candidate List and Cards */
const electionGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  textAlign: 'left'
};

const groupHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1.5px solid var(--gray-150)',
  paddingBottom: '8px'
};

const groupTitleStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--dark)'
};

const candidatesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px'
};

const candCardStyle = {
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const candProfileHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px'
};

const candTitleBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const candNameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '15px',
  fontWeight: '750',
  color: 'var(--dark)'
};

const candIdStyle = {
  fontSize: '11px',
  color: 'var(--gray-450)',
  fontWeight: '550'
};

const dividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-100)',
  margin: '12px 0'
};

const candDetailsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const detailLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const detailValStyle = {
  fontSize: '12.5px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const positionBadgeStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--primary)',
  backgroundColor: 'var(--primary-light)',
  padding: '2px 8px',
  borderRadius: '4px'
};

const manifestoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const manifestoLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const manifestoTextStyle = {
  fontSize: '12.5px',
  color: 'var(--dark-light)',
  lineHeight: 1.4,
  fontStyle: 'italic'
};

/* Voting cards stack */
const votingStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const votingCardStyle = {
  backgroundColor: '#fff',
  border: '1.5px solid var(--gray-200)',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const cardBannerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px'
};

const electTitleStyle = {
  fontSize: '16px',
  fontWeight: '750',
  color: 'var(--dark)'
};

const positionSubStyle = {
  fontSize: '12.5px',
  color: 'var(--gray-500)',
  marginTop: '4px',
  display: 'block'
};

const electDescStyle = {
  fontSize: '13px',
  color: 'var(--dark-light)',
  lineHeight: '1.45',
  marginTop: '8px'
};

/* Vote states alerts */
const voteStatePanelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  backgroundColor: 'var(--gray-50)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--gray-200)',
  color: 'var(--dark-light)',
  fontSize: '13px',
  fontWeight: '550'
};

const voteStatePanelStyleSuccess = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  backgroundColor: 'var(--success-light)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid rgba(16, 185, 129, 0.2)',
  color: 'var(--success)',
  fontSize: '13px',
  fontWeight: '600'
};

const voteStateTextStyle = {
  lineHeight: 1.3
};

const voteStateTextStyleSuccess = {
  lineHeight: 1.3
};

/* Vote Action block */
const actionVoteBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const voteActionTitleStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const votingOptionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px'
};

const voteCandidateFoilStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: 'var(--gray-50)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--gray-200)',
  textAlign: 'center'
};

const voteCandNameStyle = {
  fontSize: '13.5px',
  fontWeight: '700',
  color: 'var(--dark)',
  marginTop: '8px'
};

const voteCandMajorStyle = {
  fontSize: '11px',
  color: 'var(--gray-450)',
  marginTop: '2px'
};

/* Admin Control banner */
const adminControlPanelStyle = {
  marginTop: '20px',
  padding: '12px 16px',
  backgroundColor: '#fef2f2',
  border: '1.5px dashed #f87171',
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const adminCtrlLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#b91c1c',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const adminButtonsRowStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const adminBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  fontSize: '12px',
  fontFamily: 'var(--font-body)',
  fontWeight: '600',
  color: 'var(--dark-light)',
  border: '1.5px solid var(--gray-200)',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const adminPublishBtnStyle = {
  ...adminBtnStyle,
  backgroundColor: 'var(--secondary)',
  color: '#fff',
  border: 'none',
  boxShadow: '0 2px 4px rgba(212,160,23,0.2)'
};

/* Results Layouts */
const resultsPendingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 16px',
  textAlign: 'center',
  color: 'var(--gray-500)'
};

const resultsPendingTitleStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--dark)',
  marginTop: '12px'
};

const resultsPendingSubStyle = {
  fontSize: '13px',
  color: 'var(--gray-450)',
  marginTop: '4px',
  maxWidth: '360px',
  lineHeight: 1.4
};

const resultsActiveBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const winnerCardStyle = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: 'var(--secondary-light)',
  border: '1.5px solid rgba(212,160,23,0.25)',
  borderRadius: 'var(--radius-lg)',
  flexWrap: 'wrap',
  gap: '12px'
};

const govCardHeaderGlowStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)'
};

const winnerHeadingStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const winnerOfficerNameStyle = {
  fontSize: '15px',
  fontWeight: '800',
  color: 'var(--dark)',
  lineHeight: 1.2,
  marginTop: '2px'
};

const winnerOfficerMajorStyle = {
  fontSize: '12px',
  color: 'var(--dark-light)',
  marginTop: '2px'
};

const winnerBadgeContainerStyle = {
  display: 'flex',
  alignItems: 'center'
};

/* Charts sections */
const chartsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '24px'
};

const chartSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  textAlign: 'left'
};

const chartHeadingStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

const barListContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const barItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const barMetaRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const barVotesTextStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--gray-500)'
};

const barTrackStyle = {
  height: '10px',
  width: '100%',
  backgroundColor: 'var(--gray-100)',
  borderRadius: '999px',
  overflow: 'hidden'
};

const barFillStyle = {
  height: '100%',
  borderRadius: '999px',
  transition: 'width 1s ease-in-out'
};

/* Pie widget */
const chartWrapperStyle = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const noVotesOverlayStyle = {
  position: 'absolute',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--gray-400)'
};

const pieContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  backgroundColor: 'var(--gray-50)',
  border: '1.5px solid var(--gray-150)',
  padding: '16px',
  borderRadius: 'var(--radius-md)'
};

const pieLegendsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1
};

const legendRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const legendColorDotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  flexShrink: 0
};

const legendLabelStyle = {
  fontSize: '12px',
  fontWeight: '550',
  color: 'var(--dark-light)'
};

const resultsTotalRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  alignSelf: 'flex-end',
  fontSize: '11.5px',
  color: 'var(--gray-400)',
  fontWeight: '550'
};

const emptyBoxStyle = {
  padding: '32px',
  textAlign: 'center',
  color: 'var(--gray-450)',
  border: '1.5px dashed var(--gray-200)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '500'
};

/* Modal styles */
const modalFooterStyle = {
  display: 'flex',
  gap: '12px',
  width: '100%',
  justifyContent: 'flex-end'
};

const modalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const modalCandidateHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const modalCandNameStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--dark)',
  lineHeight: 1.2
};

const modalCandMajorStyle = {
  fontSize: '12.5px',
  color: 'var(--gray-500)',
  fontWeight: '500'
};

const modalDividerStyle = {
  border: 'none',
  borderTop: '1.5px solid var(--gray-150)',
  margin: '16px 0'
};

const modalManifestoSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const modalManifestoHeadingStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--gray-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const modalManifestoTextStyle = {
  fontSize: '13.5px',
  lineHeight: '1.5',
  color: 'var(--dark-light)',
  fontStyle: 'italic'
};

const modalCautionBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: 'rgba(239, 68, 68, 0.05)',
  border: '1.5px solid rgba(239, 68, 68, 0.25)',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--danger)',
  fontSize: '12.5px',
  marginTop: '20px',
  lineHeight: 1.4
};

/* Additional stylesheet hooks */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent += `
    button[style*="tabButtonStyle"]:hover {
      color: var(--primary) !important;
    }
    div[style*="voteCandidateFoilStyle"]:hover {
      border-color: var(--primary) !important;
      background-color: #fff !important;
      box-shadow: var(--shadow-md) !important;
    }
    @media (max-width: 900px) {
      div[style*="chartsGridStyle"] {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
    }
    @media (max-width: 600px) {
      div[style*="pieContainerStyle"] {
        flex-direction: column !important;
        align-items: center !important;
        gap: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Elections;
