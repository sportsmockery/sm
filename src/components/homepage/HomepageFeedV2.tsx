"use client"

import { useState, useEffect } from "react"
import HomeSidebar from "@/components/homepage/HomeSidebar"
import MainFeed from "@/components/homepage/MainFeed"
import TrendsSidebar from "@/components/homepage/TrendsSidebar"
import SearchHero from "@/components/homepage/SearchHero"
import { Home, Compass, Plus, Film, User, X, FileText, Video, Camera, ImageIcon } from "lucide-react"

interface HomepageFeedV2Props {
  firstName?: string
}

export default function HomepageFeedV2({ firstName }: HomepageFeedV2Props) {
  const [activeTab, setActiveTab] = useState<"for-you" | "team-pulse">("for-you")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [activeNavItem, setActiveNavItem] = useState<string>("home")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeTab, setComposeTab] = useState<"text" | "photo" | "reel" | "story">("text")

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsComposeOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <div
      className="homepage-v2 homepage-v2-light min-h-screen transition-colors duration-300 pb-16 md:pb-0"
      style={{ background: 'var(--hp-background)', color: 'var(--hp-foreground)' }}
    >
      {/* Full-screen Search Hero - above the fold */}
      <SearchHero firstName={firstName || "Chris"} />

      {/* Three-column layout - below the fold */}
      <div className="mx-auto flex max-w-[1300px]">
        {/* Left Sidebar */}
        <div className="hidden md:flex md:w-[350px] md:justify-end md:pr-6">
          <HomeSidebar
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
          />
        </div>

        {/* Main Feed */}
        <MainFeed
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTeam={selectedTeam}
        />

        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <TrendsSidebar selectedTeam={selectedTeam} />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="hp-bottom-nav hp-glass md:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveNavItem("home")}
            className={`hp-bottom-nav-item ${activeNavItem === "home" ? "active" : ""}`}
            aria-label="Home"
          >
            <Home className={`h-6 w-6 transition-transform ${activeNavItem === "home" ? "scale-110" : ""}`} />
          </button>
          <button
            onClick={() => setActiveNavItem("explore")}
            className={`hp-bottom-nav-item ${activeNavItem === "explore" ? "active" : ""}`}
            aria-label="Explore"
          >
            <Compass className={`h-6 w-6 transition-transform ${activeNavItem === "explore" ? "scale-110" : ""}`} />
          </button>
          <button
            onClick={() => setIsComposeOpen(true)}
            className="hp-bottom-nav-item"
            aria-label="Create"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg hp-fab-compose" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Plus className="h-5 w-5" />
            </div>
          </button>
          <button
            onClick={() => setActiveNavItem("reels")}
            className={`hp-bottom-nav-item ${activeNavItem === "reels" ? "active" : ""}`}
            aria-label="Reels"
          >
            <Film className={`h-6 w-6 transition-transform ${activeNavItem === "reels" ? "scale-110" : ""}`} />
          </button>
          <button
            onClick={() => setActiveNavItem("profile")}
            className={`hp-bottom-nav-item ${activeNavItem === "profile" ? "active" : ""}`}
            aria-label="Profile"
          >
            <User className={`h-6 w-6 transition-transform ${activeNavItem === "profile" ? "scale-110" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setIsComposeOpen(false)}
          />

          <div
            className="relative w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden"
            style={{ background: 'var(--hp-card)', borderRadius: '24px 24px 0 0' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--hp-border)' }}>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="rounded-full p-2 hp-tap-target"
                style={{ color: 'var(--hp-foreground)' }}
              >
                <X className="h-5 w-5" />
              </button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--hp-foreground)' }}>Create</span>
              <button className="rounded-full hp-btn-premium px-4 py-1.5 text-sm font-semibold text-white">
                Post
              </button>
            </div>

            {/* Compose Tabs */}
            <div className="flex" style={{ borderBottom: '1px solid var(--hp-border)' }}>
              <button
                onClick={() => setComposeTab("text")}
                className={`hp-compose-tab ${composeTab === "text" ? "active" : ""}`}
              >
                <FileText className="h-5 w-5 mx-auto" />
                <span className="text-xs mt-1">Text</span>
              </button>
              <button
                onClick={() => setComposeTab("photo")}
                className={`hp-compose-tab ${composeTab === "photo" ? "active" : ""}`}
              >
                <ImageIcon className="h-5 w-5 mx-auto" />
                <span className="text-xs mt-1">Photo</span>
              </button>
              <button
                onClick={() => setComposeTab("reel")}
                className={`hp-compose-tab ${composeTab === "reel" ? "active" : ""}`}
              >
                <Video className="h-5 w-5 mx-auto" />
                <span className="text-xs mt-1">Reel</span>
              </button>
              <button
                onClick={() => setComposeTab("story")}
                className={`hp-compose-tab ${composeTab === "story" ? "active" : ""}`}
              >
                <Camera className="h-5 w-5 mx-auto" />
                <span className="text-xs mt-1">Story</span>
              </button>
            </div>

            {/* Compose Content */}
            <div className="p-4 min-h-[200px]">
              {composeTab === "text" && (
                <textarea
                  placeholder="What's happening in Chicago sports?"
                  className="w-full h-32 bg-transparent text-lg resize-none outline-none"
                  style={{ color: 'var(--hp-foreground)' }}
                  autoFocus
                />
              )}
              {composeTab === "photo" && (
                <div className="flex flex-col items-center justify-center h-32 rounded-2xl" style={{ border: '2px dashed var(--hp-border)' }}>
                  <ImageIcon className="h-8 w-8 mb-2" style={{ color: 'var(--hp-muted-foreground)' }} />
                  <span style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>Tap to add photos</span>
                </div>
              )}
              {composeTab === "reel" && (
                <div className="flex flex-col items-center justify-center h-32 rounded-2xl" style={{ border: '2px dashed var(--hp-border)' }}>
                  <Video className="h-8 w-8 mb-2" style={{ color: 'var(--hp-muted-foreground)' }} />
                  <span style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>Tap to record or upload</span>
                </div>
              )}
              {composeTab === "story" && (
                <div className="flex flex-col items-center justify-center h-32 rounded-2xl" style={{ border: '2px dashed var(--hp-border)' }}>
                  <Camera className="h-8 w-8 mb-2" style={{ color: 'var(--hp-muted-foreground)' }} />
                  <span style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>Create a 24h story</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
