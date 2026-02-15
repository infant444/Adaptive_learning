/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChannels, useExploreChannels } from "../../hooks/useApi";
import { Users, Search, Lock, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Channel } from "../../lib/api";

const StudentChannels = () => {
  const [activeTab, setActiveTab] = useState<"my" | "explore">("my");
  const { channels } = useChannels();
  const { exploreChannel } = useExploreChannels();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels =
    activeTab === "my"
      ? channels.filter((ch: any) =>
          ch.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : exploreChannel.filter((ch: any) =>
          ch.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
  const join = (id: string) => async () => {
    try {
      await Channel.addTeamMember(id!);
      toast.success("Joined channel successfully!");
      navigate(`/channel/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to join channel");
    }
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
        <p className="text-gray-600 mt-1">Join and explore learning channels</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors ${
                activeTab === "my"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Channels
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors ${
                activeTab === "explore"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Explore Channels
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel: any) => (
              <div
                key={channel.id}
                onClick={() =>
                  activeTab == "my"
                    ? navigate(`/channel/${channel.id}`)
                    : toast.error("first need to join a Channel")
                }
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                      {channel.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {channel.name}
                        </h3>
                        {channel.isPrivate && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {channel.teamMembers?.length || 0} members
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {channel.description}
                </p>
                {activeTab === "explore" && (
                  <div className="flex justify-end mt-2">
                    <button
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm"
                      onClick={join(channel.id)}
                    >
                      <UserPlus className="w-4 h-4" />
                      Join
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {activeTab === "my"
                  ? "You haven't joined any channels yet"
                  : "No channels available to explore"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentChannels;
