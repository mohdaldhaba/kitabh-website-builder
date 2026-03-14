import React from 'react';
import { useTheme } from '../HubLayout';

/**
 * Wraps embedded tools (Outline, Checker, Social, Carousel) inside the hub.
 * - Strips standalone page styling (background, min-height)
 * - Neutralizes accent colors to #111 for hub theme
 * - Full dark mode support for all tools
 */
const HubToolWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dark } = useTheme();

  return (
    <>
      <style>{`
        /* ═══ Base embed overrides (light + dark) ═══ */
        .hub-tool-wrap .kb,
        .hub-tool-wrap .ks,
        .hub-tool-wrap .kc {
          background: transparent !important;
          min-height: auto !important;
        }
        .hub-tool-wrap .kc {
          padding-top: 0 !important;
        }

        /* ═══ Hub card normalization (light mode) ═══ */

        /* Normalize all white cards: softer borders, minimal shadows */
        .hub-tool-wrap .kb .kb-card,
        .hub-tool-wrap .kb .kb-cat,
        .hub-tool-wrap .kb .kb-ic,
        .hub-tool-wrap .kb .kb-pc,
        .hub-tool-wrap .kb .kb-qc,
        .hub-tool-wrap .kb .kb-rwc,
        .hub-tool-wrap .kb .kb-gc,
        .hub-tool-wrap .kb .kb-smc,
        .hub-tool-wrap .kb .kb-arc-card,
        .hub-tool-wrap .kb .kb-cta-card,
        .hub-tool-wrap .kb .kb-load-card,
        .hub-tool-wrap .kb .kb-modal,
        .hub-tool-wrap .kb .kb-shape {
          border-color: #E5E7EB !important;
          box-shadow: 0 1px 3px rgba(0,0,0,.04) !important;
        }
        .hub-tool-wrap .kb .kb-card {
          border-radius: 12px !important;
        }
        .hub-tool-wrap .kb .kb-card-foot {
          border-top-color: #E5E7EB !important;
        }

        .hub-tool-wrap .ks .ks-card,
        .hub-tool-wrap .ks .ks-pcard,
        .hub-tool-wrap .ks .ks-cta-card,
        .hub-tool-wrap .ks .ks-qa,
        .hub-tool-wrap .ks .ks-modal {
          border-color: #E5E7EB !important;
          box-shadow: 0 1px 3px rgba(0,0,0,.04) !important;
        }
        .hub-tool-wrap .ks .ks-card {
          border-radius: 12px !important;
        }
        .hub-tool-wrap .ks .ks-pc,
        .hub-tool-wrap .ks .ks-sc,
        .hub-tool-wrap .ks .ks-tabs-wrap,
        .hub-tool-wrap .ks .ks-links-inp {
          border-color: #E5E7EB !important;
        }

        .hub-tool-wrap .kc .kc-load-card {
          border-color: #E5E7EB !important;
          box-shadow: 0 1px 3px rgba(0,0,0,.04) !important;
          border-radius: 12px !important;
        }

        /* Normalize all text colors: #371D12 → #111 */
        .hub-tool-wrap .kb,
        .hub-tool-wrap .ks,
        .hub-tool-wrap .kc {
          color: #111 !important;
        }

        /* ═══ Accent color → #111 (hub neutral) ═══ */

        /* Checker (.kb) accent overrides */
        .hub-tool-wrap .kb .kb-btn-primary,
        .hub-tool-wrap .kb .kb-btn-go.on,
        .hub-tool-wrap .kb .kb-cap-btn,
        .hub-tool-wrap .kb .kb-btn-editor {
          background: #111 !important;
        }
        .hub-tool-wrap .kb .kb-btn-primary:hover,
        .hub-tool-wrap .kb .kb-btn-editor:hover {
          background: #333 !important;
        }
        .hub-tool-wrap .kb .kb-sel-btn:hover,
        .hub-tool-wrap .kb .kb-sel-btn.open,
        .hub-tool-wrap .kb .kb-sel-btn.pulse {
          border-color: #111 !important;
          color: #111 !important;
          animation: none !important;
        }
        .hub-tool-wrap .kb .kb-type-pill.on {
          border-color: #111 !important;
          background: #111 !important;
          color: #FFF !important;
        }
        .hub-tool-wrap .kb .kb-type-pill:hover {
          border-color: #111 !important;
          color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-load-prog-fill {
          background: #111 !important;
        }
        .hub-tool-wrap .kb .kb-load-step.active {
          border-color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-load-step.active .kb-load-step-txt {
          color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-qc {
          border-top-color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-subtype-pill.on {
          border-color: #111 !important;
          color: #111 !important;
        }

        /* Outline (.kb) embedded overrides — same class but different tool */
        .hub-tool-wrap .kb .kb-sel-check { color: #111 !important; }
        .hub-tool-wrap .kb .kb-sel-item.sel .kb-sel-item-name { color: #111 !important; }
        .hub-tool-wrap .kb .kb-subtype-custom-input:focus { border-color: #111 !important; }
        .hub-tool-wrap .kb .kb-mic-btn { border-color: #111 !important; }
        .hub-tool-wrap .kb .kb-rec-ta:focus { border-color: #111 !important; }
        .hub-tool-wrap .kb .kb-trans-ta:focus { border-color: #111 !important; }
        .hub-tool-wrap .kb .kb-cap-inp:focus { border-color: #111 !important; }
        .hub-tool-wrap .kb .kb-btn-icon:hover { border-color: #111 !important; color: #111 !important; }
        .hub-tool-wrap .kb .kb-share-copy:hover { border-color: #111 !important; color: #111 !important; }
        .hub-tool-wrap .kb .kb-outline-card-num { color: #111 !important; background: #E5E7EB !important; }
        .hub-tool-wrap .kb .kb-arc-dot { background: #111 !important; }
        .hub-tool-wrap .kb .kb-arc-phase { color: #111 !important; }
        .hub-tool-wrap .kb .kb-step-num { background: #111 !important; }

        /* Carousel (.kc) accent overrides */
        .hub-tool-wrap .kc .kc-int-btn.on {
          border-color: #111 !important;
          color: #111 !important;
          background: #F3F4F6 !important;
        }
        .hub-tool-wrap .kc .kc-gen-btn {
          background: #111 !important;
        }
        .hub-tool-wrap .kc .kc-gen-btn:hover {
          background: #333 !important;
        }

        /* Social (.ks) accent overrides */
        .hub-tool-wrap .ks .ks-btn-go {
          background: #111 !important;
        }
        .hub-tool-wrap .ks .ks-btn-go:hover {
          background: #333 !important;
        }
        .hub-tool-wrap .ks .ks-pc[aria-pressed="true"] {
          border-color: #111 !important;
          background: #111 !important;
          color: #fff !important;
        }
        .hub-tool-wrap .ks .ks-sc[aria-pressed="true"] {
          border-color: #111 !important;
          color: #111 !important;
          background: #F3F4F6 !important;
        }
        .hub-tool-wrap .ks .ks-btn-back {
          border-color: #E5E7EB !important;
          color: #6B7280 !important;
        }
        .hub-tool-wrap .ks .ks-btn-back:hover {
          border-color: #111 !important;
          color: #111 !important;
        }
        .hub-tool-wrap .ks .ks-cap-btn {
          background: #111 !important;
        }
        .hub-tool-wrap .ks .ks-cap-inp:focus {
          border-color: #111 !important;
        }
        .hub-tool-wrap .ks .ks-links-inp:focus {
          border-color: #111 !important;
        }

        /* Back buttons for all tools */
        .hub-tool-wrap .kb .kb-btn-back,
        .hub-tool-wrap .kb .kb-exp-btn {
          border-color: #E5E7EB !important;
        }
        .hub-tool-wrap .kb .kb-btn-back:hover {
          border-color: #111 !important;
          color: #111 !important;
        }

        ${dark ? `
        /* ═══════════════════════════════════════════ */
        /* ═══ DARK MODE — all tools ═══════════════ */
        /* ═══════════════════════════════════════════ */

        .hub-tool-wrap .kb,
        .hub-tool-wrap .ks,
        .hub-tool-wrap .kc {
          color: #F9FAFB !important;
        }

        /* ── Tool headlines → white in dark mode ── */
        .hub-tool-wrap .kb .kel-h,
        .hub-tool-wrap .kb .kel-s,
        .hub-tool-wrap .kb .kdl-h,
        .hub-tool-wrap .kb .kdl-s,
        .hub-tool-wrap .ks .ks-hero-h,
        .hub-tool-wrap .ks .ks-hero-s,
        .hub-tool-wrap .ks .ks-res-title,
        .hub-tool-wrap .ks .ks-res-sub,
        .hub-tool-wrap .kc .kc-head-t,
        .hub-tool-wrap .kc .kc-head-s {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .kb .kel-s,
        .hub-tool-wrap .kb .kdl-s,
        .hub-tool-wrap .ks .ks-hero-s,
        .hub-tool-wrap .ks .ks-res-sub,
        .hub-tool-wrap .kc .kc-head-s {
          color: #9CA3AF !important;
        }

        /* ── White backgrounds → dark card ── */
        .hub-tool-wrap .kb .kb-card,
        .hub-tool-wrap .kb .kb-sel-menu,
        .hub-tool-wrap .kb .kb-load-card,
        .hub-tool-wrap .kb .kb-modal,
        .hub-tool-wrap .kb .kb-cat,
        .hub-tool-wrap .kb .kb-ic,
        .hub-tool-wrap .kb .kb-pc,
        .hub-tool-wrap .kb .kb-qc,
        .hub-tool-wrap .kb .kb-rwc,
        .hub-tool-wrap .kb .kb-gc,
        .hub-tool-wrap .kb .kb-shape,
        .hub-tool-wrap .kb .kb-card-foot,
        .hub-tool-wrap .kb .kb-ta,
        .hub-tool-wrap .kb .kb-btn-back,
        .hub-tool-wrap .kb .kb-exp-btn {
          background: #161616 !important;
          color: #F9FAFB !important;
          border-color: rgba(255,255,255,0.1) !important;
        }

        /* Checker text colors */
        .hub-tool-wrap .kb [style*="color: rgb(55, 29, 18)"],
        .hub-tool-wrap .kb [style*="color:#371D12"],
        .hub-tool-wrap .kb .kb-ta {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .kb [style*="color: rgb(78, 78, 78)"],
        .hub-tool-wrap .kb [style*="color: rgb(129, 129, 129)"] {
          color: #9CA3AF !important;
        }

        /* Checker backgrounds */
        .hub-tool-wrap .kb .kb-load-hicon {
          background: #2A2A2A !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .hub-tool-wrap .kb .kb-imp {
          background: #1A1A1A !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .hub-tool-wrap .kb .kb-grule {
          background: #1A1A1A !important;
          border-right-color: #DFB300 !important;
          color: #D1D5DB !important;
        }

        /* Gray backgrounds → dark subtle */
        .hub-tool-wrap .kb [style*="background: rgb(242, 242, 242)"],
        .hub-tool-wrap .kb [style*="background:#F2F2F2"],
        .hub-tool-wrap .kb .kb-load-step-ico,
        .hub-tool-wrap .kb .kb-load-prog {
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kb [style*="background: rgb(250, 250, 250)"],
        .hub-tool-wrap .kb [style*="background: rgb(249, 250, 251)"],
        .hub-tool-wrap .kb [style*="background:#FAFAFA"],
        .hub-tool-wrap .kb [style*="background:#F9FAFB"] {
          background: #1A1A1A !important;
        }

        /* Border overrides for dark */
        .hub-tool-wrap .kb [style*="border"] {
          border-color: rgba(255,255,255,0.08) !important;
        }
        .hub-tool-wrap .kb .kb-type-pill,
        .hub-tool-wrap .kb .kb-subtype-pill,
        .hub-tool-wrap .kb .kb-sel-btn {
          border-color: rgba(255,255,255,0.12) !important;
          color: #D1D5DB !important;
        }
        .hub-tool-wrap .kb .kb-type-pill:hover,
        .hub-tool-wrap .kb .kb-subtype-pill:hover,
        .hub-tool-wrap .kb .kb-sel-btn:hover,
        .hub-tool-wrap .kb .kb-sel-btn.open {
          border-color: #F9FAFB !important;
          color: #F9FAFB !important;
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kb .kb-type-pill.on {
          border-color: #F9FAFB !important;
          background: #F9FAFB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-subtype-pill.on {
          border-color: #F9FAFB !important;
          background: #1F1F1F !important;
          color: #F9FAFB !important;
        }

        /* Dark buttons should invert */
        .hub-tool-wrap .kb .kb-btn-primary,
        .hub-tool-wrap .kb .kb-btn-go.on,
        .hub-tool-wrap .kb .kb-cap-btn,
        .hub-tool-wrap .kb .kb-btn-editor {
          background: #F9FAFB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .kb .kb-btn-primary:hover,
        .hub-tool-wrap .kb .kb-btn-editor:hover {
          background: #E5E7EB !important;
          color: #111 !important;
        }

        /* Inputs */
        .hub-tool-wrap .kb input,
        .hub-tool-wrap .kb textarea,
        .hub-tool-wrap .kb select {
          background: #1A1A1A !important;
          color: #F9FAFB !important;
          border-color: rgba(255,255,255,0.1) !important;
          color-scheme: dark;
        }
        .hub-tool-wrap .kb input:focus,
        .hub-tool-wrap .kb textarea:focus {
          border-color: #F9FAFB !important;
        }

        /* Load progress */
        .hub-tool-wrap .kb .kb-load-prog-fill {
          background: #F9FAFB !important;
        }
        .hub-tool-wrap .kb .kb-load-step.active {
          border-color: #F9FAFB !important;
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kb .kb-load-step.active .kb-load-step-txt {
          color: #F9FAFB !important;
        }

        /* Outline specific dark */
        .hub-tool-wrap .kb .kb-outline-card-num {
          color: #F9FAFB !important;
          background: #2A2A2A !important;
        }
        .hub-tool-wrap .kb .kb-arc-dot { background: #F9FAFB !important; }
        .hub-tool-wrap .kb .kb-arc-phase { color: #F9FAFB !important; }
        .hub-tool-wrap .kb .kb-step-num { background: #F9FAFB !important; color: #111 !important; }
        .hub-tool-wrap .kb .kb-sel-check { color: #F9FAFB !important; }
        .hub-tool-wrap .kb .kb-btn-icon { border-color: rgba(255,255,255,0.12) !important; color: #D1D5DB !important; }
        .hub-tool-wrap .kb .kb-btn-icon:hover { border-color: #F9FAFB !important; color: #F9FAFB !important; background: #1F1F1F !important; }
        .hub-tool-wrap .kb .kb-share-copy { border-color: rgba(255,255,255,0.12) !important; color: #D1D5DB !important; }
        .hub-tool-wrap .kb .kb-share-copy:hover { border-color: #F9FAFB !important; color: #F9FAFB !important; }
        .hub-tool-wrap .kb .kb-title-card { border-color: rgba(255,255,255,0.1) !important; background: #161616 !important; }
        .hub-tool-wrap .kb .kb-title-card:hover { border-color: rgba(255,255,255,0.2) !important; background: #1F1F1F !important; }

        /* Checker QC border */
        .hub-tool-wrap .kb .kb-qc {
          border-top-color: #F9FAFB !important;
        }

        /* ── Social (.ks) dark mode ── */
        .hub-tool-wrap .ks {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .ks [style*="background: rgb(255, 255, 255)"],
        .hub-tool-wrap .ks [style*="background:#fff"],
        .hub-tool-wrap .ks [style*="background: #fff"],
        .hub-tool-wrap .ks [style*="background: white"] {
          background: #161616 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .hub-tool-wrap .ks [style*="background: rgb(242, 242, 242)"],
        .hub-tool-wrap .ks [style*="background: rgb(243, 244, 246)"],
        .hub-tool-wrap .ks [style*="background:#F3F4F6"],
        .hub-tool-wrap .ks [style*="background:#F2F2F2"] {
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .ks [style*="color: rgb(55, 29, 18)"],
        .hub-tool-wrap .ks [style*="color:#371D12"] {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .ks [style*="color: rgb(107, 114, 128)"],
        .hub-tool-wrap .ks [style*="color: rgb(129, 129, 129)"] {
          color: #9CA3AF !important;
        }
        .hub-tool-wrap .ks input,
        .hub-tool-wrap .ks textarea,
        .hub-tool-wrap .ks select {
          background: #1A1A1A !important;
          color: #F9FAFB !important;
          border-color: rgba(255,255,255,0.1) !important;
          color-scheme: dark;
        }
        .hub-tool-wrap .ks button[style*="background: rgb(17, 17, 17)"],
        .hub-tool-wrap .ks button[style*="background: rgb(26, 26, 26)"],
        .hub-tool-wrap .ks button[style*="background:#111"],
        .hub-tool-wrap .ks button[style*="background: #111"] {
          background: #F9FAFB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .ks [style*="border"] {
          border-color: rgba(255,255,255,0.08) !important;
        }
        .hub-tool-wrap .ks .ks-sc[aria-pressed="true"] {
          background: #F9FAFB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .ks .ks-tog input:checked + span {
          background: #F9FAFB !important;
        }

        /* ── Carousel (.kc) dark mode ── */
        .hub-tool-wrap .kc {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .kc .kc-in,
        .hub-tool-wrap .kc .kc-loading {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .kc .kc-head-t,
        .hub-tool-wrap .kc .kc-load-title,
        .hub-tool-wrap .kc .kc-load-step-txt {
          color: #F9FAFB !important;
        }
        .hub-tool-wrap .kc .kc-head-sub,
        .hub-tool-wrap .kc .kc-intensity-l {
          color: #9CA3AF !important;
        }
        .hub-tool-wrap .kc .kc-int-btn {
          background: #161616 !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: #9CA3AF !important;
        }
        .hub-tool-wrap .kc .kc-int-btn:hover {
          border-color: rgba(255,255,255,0.2) !important;
          color: #D1D5DB !important;
        }
        .hub-tool-wrap .kc .kc-int-btn.on {
          border-color: #F9FAFB !important;
          color: #F9FAFB !important;
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kc input,
        .hub-tool-wrap .kc textarea,
        .hub-tool-wrap .kc select {
          background: #1A1A1A !important;
          color: #F9FAFB !important;
          border-color: rgba(255,255,255,0.1) !important;
          color-scheme: dark;
        }
        .hub-tool-wrap .kc .kc-gen-btn {
          background: #F9FAFB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .kc .kc-gen-btn:hover {
          background: #E5E7EB !important;
          color: #111 !important;
        }
        .hub-tool-wrap .kc .kc-load-step-ico {
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kc .kc-load-prog {
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kc .kc-load-prog-fill {
          background: #F9FAFB !important;
        }
        .hub-tool-wrap .kc [style*="background: rgb(255, 255, 255)"],
        .hub-tool-wrap .kc [style*="background:#FFF"],
        .hub-tool-wrap .kc [style*="background:#fff"],
        .hub-tool-wrap .kc [style*="background: white"] {
          background: #161616 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .hub-tool-wrap .kc [style*="background: rgb(248, 248, 248)"],
        .hub-tool-wrap .kc [style*="background: rgb(242, 242, 242)"],
        .hub-tool-wrap .kc [style*="background: rgb(243, 244, 246)"] {
          background: #1F1F1F !important;
        }
        .hub-tool-wrap .kc [style*="border"] {
          border-color: rgba(255,255,255,0.08) !important;
        }
        ` : ''}
      `}</style>
      <div className="hub-tool-wrap" style={{ width: '100%' }}>
        {children}
      </div>
    </>
  );
};

export default HubToolWrapper;
