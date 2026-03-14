import React from 'react';

/**
 * Wraps embedded tools (Outline, Checker, Social, Carousel) inside the hub.
 * - Strips standalone page styling (background, min-height)
 * - Neutralizes accent colors to #111 for hub theme
 */
const HubToolWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
    <>
      <style>{`
        /* ═══ Base embed overrides ═══ */
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
      `}</style>
      <div className="hub-tool-wrap" style={{ width: '100%' }}>
        {children}
      </div>
    </>
  );
};

export default HubToolWrapper;
