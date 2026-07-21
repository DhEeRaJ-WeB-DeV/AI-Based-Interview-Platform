import { motion } from "framer-motion";
import { CalendarDays, Clock3, Briefcase, FileText, CheckCircle2,PartyPopper,X } from "lucide-react";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

 

const ConfirmationCard = ({ booking, onCancel}) => {
  const { roundName, role, jobDescription, slot } = booking;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-900 shadow-2xl shadow-emerald-900/20"
      >
         <button
            onClick={onCancel}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-all hover:bg-red-500 hover:text-white"
          >
            <X size={20} />
          </button>
        {/* Top gradient */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-400 to-cyan-400" />

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 180,
              }}
              className="mb-4"
            >
              <CheckCircle2
                size={72}
                className="text-emerald-400 drop-shadow-lg"
              />
            </motion.div>

            <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
              Interview Scheduled 
               <PartyPopper className="h-8 w-8 text-yellow-400" />
            </h2>

            <p className="mt-2 text-slate-400">
              Your interview has been successfully scheduled.
            </p>
          </div>

          {/* Details */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Briefcase size={18} />
                <span className="text-sm font-medium">Role</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">{role}</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileText size={18} />
                <span className="text-sm font-medium">Round</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {roundName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CalendarDays size={18} />
                <span className="text-sm font-medium">Interview Date</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {new Date(slot.start).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Clock3 size={18} />
                <span className="text-sm font-medium">Time</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatTime(slot.start)} – {formatTime(slot.end)}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <FileText size={20} className="text-emerald-400" />
              Job Description
            </h3>

            <p className="leading-7 whitespace-pre-wrap text-slate-300">
              {jobDescription}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <p className="text-sm text-emerald-300">
              📧 Interview details have been sent to your registered email.
              Please join a few minutes before your scheduled time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationCard;