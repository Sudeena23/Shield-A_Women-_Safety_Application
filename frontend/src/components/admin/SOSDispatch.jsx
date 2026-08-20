// SOSDispatch.js
import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, MapPin, Phone, Send, Radio, 
  AlertTriangle, CheckCircle, XCircle, Filter,
  User, Calendar, Shield, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { alertService } from "../../services/alertService";

export const SOSDispatch = ({ dispatches, setDispatches }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update dispatch status
  const handleUpdateStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      setDispatches((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await alertService.updateAlertStatus(id, newStatus);
      
      // Show success notification
      showNotification(`Alert ${id} marked as ${newStatus}`, 'success');
    } catch (e) {
      console.error('Failed to update alert status', e);
      showNotification('Failed to update alert status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete dispatch
  const handleDeleteDispatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SOS alert?')) return;
    
    setLoading(true);
    try {
      setDispatches((prev) => prev.filter((item) => item.id !== id));
      await alertService.deleteAlert(id);
      showNotification('Alert deleted successfully', 'success');
    } catch (e) {
      console.error('Failed to delete alert', e);
      showNotification('Failed to delete alert', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dispatches
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const alertsData = await alertService.getAlerts();
      const mappedDispatches = alertsData.map((a, idx) => ({
        id: a.id || `DISP-${8900 + idx}`,
        victimName: a.user || a.victimName || 'Unknown User',
        victimPhone: a.victimPhone || '+977 9841-382910',
        bloodGroup: a.bloodGroup || 'O+',
        medicalNotes: a.medicalNotes || 'No medical notes',
        location: a.location || 'Kathmandu, Nepal',
        triggeredAt: a.timestamp || new Date().toLocaleString(),
        status: a.status || 'Active',
        type: a.type || 'SOS Alert',
        guardianCount: a.recipientsCount || 2,
        duressActivated: !!a.duressActivated,
        ipLog: a.ipLog || '127.0.0.1',
        latitude: a.latitude || '27.7172',
        longitude: a.longitude || '85.3240',
      }));
      setDispatches(mappedDispatches);
      showNotification('Dispatches refreshed', 'success');
    } catch (e) {
      console.error('Failed to refresh alerts', e);
      showNotification('Failed to refresh', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification (simple alert for demo)
  const showNotification = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // Filtered dispatches
  const filteredDispatches = dispatches.filter((item) => {
    const matchesSearch =
      item.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.victimPhone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status styling
  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        color: 'bg-red-500/20 text-red-400 border-red-500/40',
        icon: <Radio className="w-3 h-3 animate-pulse" />,
        label: '🟢 Active SOS',
        pulse: true
      },
      'Unit Dispatched': {
        color: 'bg-[#3d2212] text-[#e0c8ad] border-[#814a27]',
        icon: <Send className="w-3 h-3" />,
        label: '🚔 Unit Dispatched',
        pulse: false
      },
      'Accidental/Prank': {
        color: 'bg-[#1a0c05] text-[#cb9d75]/70 border-[#3d2212]',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: '⚠️ False Alarm',
        pulse: false
      },
      'Resolved': {
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        icon: <CheckCircle className="w-3 h-3" />,
        label: '✅ Resolved',
        pulse: false
      }
    };
    return configs[status] || configs['Active'];
  };

  // View dispatch details
  const viewDetails = (dispatch) => {
    setSelectedDispatch(dispatch);
    setShowDetailsModal(true);
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    // Simple implementation - you can use a library like moment.js
    return timestamp;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#28150a] rounded-2xl p-4 border border-[#3d2212]">
          <div className="text-[#cb9d75]/60 text-[10px] font-medium uppercase">Total Alerts</div>
          <div className="text-xl font-black text-white mt-1">{dispatches.length}</div>
        </div>
        <div className="bg-[#28150a] rounded-2xl p-4 border border-[#3d2212]">
          <div className="text-[#cb9d75]/60 text-[10px] font-medium uppercase">Active SOS</div>
          <div className="text-xl font-black text-red-400 mt-1 flex items-center gap-2">
            {dispatches.filter(d => d.status === 'Active').length}
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </div>
        </div>
        <div className="bg-[#28150a] rounded-2xl p-4 border border-[#3d2212]">
          <div className="text-[#cb9d75]/60 text-[10px] font-medium uppercase">Dispatched</div>
          <div className="text-xl font-black text-[#cb9d75] mt-1">
            {dispatches.filter(d => d.status === 'Unit Dispatched').length}
          </div>
        </div>
        <div className="bg-[#28150a] rounded-2xl p-4 border border-[#3d2212]">
          <div className="text-[#cb9d75]/60 text-[10px] font-medium uppercase">Resolved</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {dispatches.filter(d => d.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#28150a] p-4 rounded-2xl border border-[#3d2212]">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#cb9d75]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, phone, or location..."
            className="w-full bg-[#1a0c05] border border-[#3d2212] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#9e6133] placeholder-[#cb9d75]/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#cb9d75]/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1a0c05] border border-[#3d2212] text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e6133] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">🟢 Active SOS</option>
              <option value="Unit Dispatched">🚔 Unit Dispatched</option>
              <option value="Accidental/Prank">⚠️ False Alarm</option>
              <option value="Resolved">✅ Resolved</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-[#3d2212] hover:bg-[#522f18] text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* SOS Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDispatches.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <div
              key={item.id}
              className={`bg-[#28150a] rounded-3xl p-6 border transition-all space-y-4 shadow-xl ${
                item.status === 'Active'
                  ? 'border-red-500/80 shadow-red-950/40 animate-pulse'
                  : item.status === 'Unit Dispatched'
                  ? 'border-[#cb9d75]'
                  : item.status === 'Accidental/Prank'
                  ? 'border-[#3d2212] opacity-80'
                  : 'border-emerald-500/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#3d2212] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#3d2212] text-white font-black flex items-center justify-center text-sm border border-[#522f18]">
                    {item.victimName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-[#cb9d75]/60">{item.id}</div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      {item.victimName}
                      {item.duressActivated && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-900/60 text-red-400 border border-red-700 px-2 py-0.5 rounded">
                          🚨 Duress
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1a0c05] p-3 rounded-2xl border border-[#3d2212] space-y-1">
                  <span className="text-[#cb9d75]/70 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Contact
                  </span>
                  <div className="font-bold text-white">{item.victimPhone}</div>
                  <div className="text-red-400 font-extrabold text-[11px]">🩸 Blood: {item.bloodGroup}</div>
                </div>

                <div className="bg-[#1a0c05] p-3 rounded-2xl border border-[#3d2212] space-y-1">
                  <span className="text-[#cb9d75]/70 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Triggered
                  </span>
                  <div className="font-bold text-white">{getTimeAgo(item.triggeredAt)}</div>
                  <div className="text-[#cb9d75]/80 text-[11px]">👥 {item.guardianCount} Guardians</div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-[#1a0c05] p-3.5 rounded-2xl border border-[#3d2212] space-y-1 text-xs">
                <div className="text-[#cb9d75]/70 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> 📍 Live Location
                </div>
                <div className="font-bold text-[#f7f0e6]">{item.location}</div>
                {item.ipLog && (
                  <div className="text-[10px] text-[#cb9d75]/50 font-mono flex items-center gap-1">
                    🌐 {item.ipLog}
                  </div>
                )}
                {item.latitude && item.longitude && (
                  <div className="text-[10px] text-[#cb9d75]/40 font-mono">
                    📌 {item.latitude}, {item.longitude}
                  </div>
                )}
              </div>

              {/* Medical Notes */}
              {item.medicalNotes && item.medicalNotes !== 'No medical notes' && (
                <div className="text-xs bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212] text-[#cb9d75]/80">
                  <strong className="text-[#e0c8ad]">🏥 Medical Notes:</strong> {item.medicalNotes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2 border-t border-[#3d2212]">
                <a
                  href={`tel:${item.victimPhone}`}
                  className="flex-1 bg-[#3d2212] hover:bg-[#522f18] text-white font-bold py-2.5 px-3 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#522f18]"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Victim
                </a>

                <button
                  onClick={() => viewDetails(item)}
                  className="bg-[#3d2212] hover:bg-[#522f18] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-[#522f18]"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>

                {item.status === 'Active' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Unit Dispatched')}
                    className="bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#9e6133]/30"
                  >
                    <Send className="w-3.5 h-3.5" /> 🚔 Dispatch
                  </button>
                )}

                {item.status !== 'Accidental/Prank' && item.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Accidental/Prank')}
                    className="bg-[#3d2212] hover:bg-[#522f18] text-[#e0c8ad] font-bold py-2.5 px-3 rounded-xl text-xs border border-[#814a27] transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> False
                  </button>
                )}

                {item.status !== 'Resolved' && item.status !== 'Accidental/Prank' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}

                <button
                  onClick={() => handleDeleteDispatch(item.id)}
                  className="bg-[#3d2212] hover:bg-red-950/50 text-[#cb9d75]/60 hover:text-red-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-[#3d2212] hover:border-red-800 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDispatches.length === 0 && (
        <div className="text-center py-16 text-[#cb9d75]/60 bg-[#28150a] rounded-3xl border border-[#3d2212]">
          <Radio className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold text-[#cb9d75]/40">No SOS Alerts Found</p>
          <p className="text-xs mt-2">Try adjusting your search or filter criteria</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-[#3d2212] hover:bg-[#522f18] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#28150a] border border-[#3d2212] rounded-3xl p-6 max-w-2xl w-full text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#3d2212] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3d2212] text-white font-black flex items-center justify-center text-lg border border-[#522f18]">
                  {selectedDispatch.victimName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-[#cb9d75]/60">{selectedDispatch.id}</div>
                  <h3 className="text-xl font-black text-white">{selectedDispatch.victimName}</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-[#cb9d75] hover:text-white cursor-pointer text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212]">
                  <div className="text-[#cb9d75]/60 text-[10px] uppercase font-bold">Status</div>
                  <div className={`font-bold flex items-center gap-2 mt-1 ${selectedDispatch.status === 'Active' ? 'text-red-400' : 'text-white'}`}>
                    {getStatusConfig(selectedDispatch.status).icon}
                    {selectedDispatch.status}
                  </div>
                </div>
                <div className="bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212]">
                  <div className="text-[#cb9d75]/60 text-[10px] uppercase font-bold">Blood Group</div>
                  <div className="font-bold text-red-400 mt-1">{selectedDispatch.bloodGroup}</div>
                </div>
              </div>

              <div className="bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#cb9d75]/60">📞 Phone</span>
                  <span className="font-bold text-white">{selectedDispatch.victimPhone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#cb9d75]/60">📍 Location</span>
                  <span className="font-bold text-[#f7f0e6] text-right">{selectedDispatch.location}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#cb9d75]/60">⏱️ Triggered</span>
                  <span className="font-bold text-white">{getTimeAgo(selectedDispatch.triggeredAt)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#cb9d75]/60">👥 Guardians</span>
                  <span className="font-bold text-white">{selectedDispatch.guardianCount} notified</span>
                </div>
                {selectedDispatch.ipLog && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#cb9d75]/60">🌐 IP Address</span>
                    <span className="font-mono text-[#cb9d75]/80">{selectedDispatch.ipLog}</span>
                  </div>
                )}
                {selectedDispatch.latitude && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#cb9d75]/60">📌 Coordinates</span>
                    <span className="font-mono text-[#cb9d75]/80">{selectedDispatch.latitude}, {selectedDispatch.longitude}</span>
                  </div>
                )}
              </div>

              {selectedDispatch.medicalNotes && selectedDispatch.medicalNotes !== 'No medical notes' && (
                <div className="bg-[#1a0c05] p-3 rounded-xl border border-[#3d2212]">
                  <div className="text-[#cb9d75]/60 text-[10px] uppercase font-bold">🏥 Medical Notes</div>
                  <div className="text-sm text-[#cb9d75]/80 mt-1">{selectedDispatch.medicalNotes}</div>
                </div>
              )}

              {selectedDispatch.duressActivated && (
                <div className="bg-red-950/30 p-3 rounded-xl border border-red-800 text-red-400">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold text-xs">🚨 Duress Mode Activated</span>
                  </div>
                  <p className="text-xs text-red-400/70 mt-1">User triggered silent alarm</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#3d2212]">
              <a
                href={`tel:${selectedDispatch.victimPhone}`}
                className="flex-1 bg-[#3d2212] hover:bg-[#522f18] text-white font-bold py-2.5 px-4 rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#522f18]"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> Call Victim
              </a>
              
              {selectedDispatch.status === 'Active' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedDispatch.id, 'Unit Dispatched');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 bg-[#9e6133] hover:bg-[#814a27] text-white font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#9e6133]/30"
                >
                  <Send className="w-4 h-4" /> 🚔 Dispatch Unit
                </button>
              )}
              
              {selectedDispatch.status !== 'Resolved' && selectedDispatch.status !== 'Accidental/Prank' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedDispatch.id, 'Resolved');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};