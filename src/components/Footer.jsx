import React from 'react';
import { Award, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-8 mb-6 border-t border-gray-900 pt-6 text-center select-none">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-wider font-semibold text-gray-500 uppercase">
          <Award className="w-4 h-4 text-green-500/60" />
          <span>EE6304 Embedded Systems Design</span>
          <span className="text-gray-800">|</span>
          <Compass className="w-4 h-4 text-blue-500/60" />
          <span>Department of Electrical and Information Engineering</span>
        </div>
        <p className="text-sm font-bold text-white tracking-wide mt-1">
          University of Ruhuna, Sri Lanka
        </p>
        <p className="text-[10px] font-medium text-gray-600 mt-2 font-mono leading-none">
          © {new Date().getFullYear()} Smart domestic power monitoring gateway dashboard telemetry project.
        </p>
      </div>
    </footer>
  );
}
