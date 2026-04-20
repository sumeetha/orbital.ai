import { useState } from 'react';
import { UserPlus, MoreHorizontal, Trash2, Shield, Eye, Edit3 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { useStore } from '../../store';
import type { TeamRole } from '../../mock/settings';

const roleConfig: Record<TeamRole, { label: string; color: 'violet' | 'blue' | 'slate'; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'violet', icon: Shield },
  editor: { label: 'Editor', color: 'blue', icon: Edit3 },
  viewer: { label: 'Viewer', color: 'slate', icon: Eye },
};

export function TeamPage() {
  const { teamMembers, inviteMember, updateMemberRole, removeMember } = useStore();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('editor');
      setShowInvite(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Manage team members and their access levels"
        actions={
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} /> Invite Teammate
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orbital-border-light text-left text-orbital-text-muted">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => {
                const rc = roleConfig[member.role];
                return (
                  <tr key={member.id} className="border-b border-orbital-border-light last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orbital-primary/10 text-orbital-primary flex items-center justify-center text-xs font-bold">
                          {member.avatarInitials}
                        </div>
                        <div>
                          <div className="font-medium text-orbital-text-dark">{member.name}</div>
                          <div className="text-xs text-orbital-text-muted">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={rc.color}>{rc.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={member.status === 'active' ? 'green' : 'amber'}>
                        {member.status === 'active' ? 'Active' : 'Invited'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-orbital-text-muted">{member.lastActive}</td>
                    <td className="px-4 py-3 text-right relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-orbital-text-muted"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenu === member.id && (
                        <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-orbital-border-light z-10 w-44 py-1">
                          {(['admin', 'editor', 'viewer'] as TeamRole[]).map((role) => {
                            const RoleIcon = roleConfig[role].icon;
                            return (
                              <button
                                key={role}
                                onClick={() => { updateMemberRole(member.id, role); setOpenMenu(null); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                                  member.role === role ? 'text-orbital-primary font-medium' : 'text-orbital-text-dark'
                                }`}
                              >
                                <RoleIcon size={14} />
                                Set as {roleConfig[role].label}
                              </button>
                            );
                          })}
                          <div className="border-t border-orbital-border-light my-1" />
                          <button
                            onClick={() => { removeMember(member.id); setOpenMenu(null); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Teammate">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-orbital-text-dark mb-1.5 block">Email address</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-orbital-text-dark mb-1.5 block">Role</label>
            <div className="flex gap-2">
              {(['admin', 'editor', 'viewer'] as TeamRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    inviteRole === role
                      ? 'border-orbital-primary bg-orbital-primary/5 text-orbital-primary'
                      : 'border-orbital-border-light text-orbital-text-muted hover:bg-slate-50'
                  }`}
                >
                  {roleConfig[role].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>Send Invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
