'use client';

import { SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { FiMenu, FiX, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function LeftSidebar({ isOpen, onToggle }: LeftSidebarProps) {
  const { isSignedIn, user } = useUser();

  return (
    <>
      {/* Sidebar toggle button - positioned to not obstruct header */}
      <button
        onClick={onToggle}
        className="fixed top-16 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow lg:hidden"
        aria-label="Toggle sidebar"
      >
        <FiMenu size={20} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mutanabbi
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Authentication Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {isSignedIn ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in
                    </p>
                  </div>
                </div>
                <SignOutButton>
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                    <FiLogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <FiUser size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Not signed in
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sign in to save your work
                    </p>
                  </div>
                </div>
                <SignInButton mode="modal">
                  <button className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                    <FiLogIn size={16} />
                    <span>Sign in</span>
                  </button>
                </SignInButton>
              </div>
            )}
          </div>

          {/* Navigation or additional content can go here */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Features
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>• Real-time text analysis</p>
                <p>• Grammar suggestions</p>
                <p>• Translation support</p>
                <p>• Arabic composition tools</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Improve your Arabic writing
            </p>
          </div>
        </div>
      </div>
    </>
  );
}