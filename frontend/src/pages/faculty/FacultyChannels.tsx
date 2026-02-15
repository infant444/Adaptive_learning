/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useChannels } from "../../hooks/useApi";
import { Plus, Copy, MoreVertical, Trash2, Edit, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Channel } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const FacultyChannels = () => {
  const { channels, refetch } = useChannels();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Channel.create(formData);
      setFormData({ name: "", description: "", isPrivate: false });
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Channel.update(selectedChannel.id, formData);
      setShowUpdateModal(false);
      setSelectedChannel(null);
      setFormData({ name: "", description: "", isPrivate: false });
      refetch();
      toast.success("Channel updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update channel");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await Channel.delete(id);
      refetch();
      setShowMenu(null);
      toast.success("Channel deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete channel");
    }
  };

  const copyJoinLink = (id: string) => {
    const link = `${window.location.origin}/join-channel/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Join link copied!");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
        {user?.role === "faculty" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create Channel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel: any) => (
          <div
            key={channel.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/channel/${channel.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                  {channel.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex">
                    {" "}
                    <h3 className="font-semibold text-gray-900">
                      {channel.name}
                    </h3>
                    {channel.isPrivate && (
                      <Lock size={20} color="gray" className="ml-3" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {channel.teamMembers?.length || 0} members
                  </p>
                </div>
              </div>
              {user?.role === "faculty" && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === channel.id ? null : channel.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showMenu === channel.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChannel(channel);
                          setFormData({
                            name: channel.name,
                            description: channel.description,
                            isPrivate: channel.isPrivate,
                          });
                          setShowUpdateModal(true);
                          setShowMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Update
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(channel.id);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{channel.description}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyJoinLink(channel.id);
              }}
              className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100"
            >
              <Copy className="w-4 h-4" />
              Copy Join Link
            </button>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Channel</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Private Channel
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPrivate: !formData.isPrivate })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isPrivate ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isPrivate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Channel</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Private Channel
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isPrivate: !formData.isPrivate })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isPrivate ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isPrivate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedChannel(null);
                    setFormData({
                      name: "",
                      description: "",
                      isPrivate: false,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
