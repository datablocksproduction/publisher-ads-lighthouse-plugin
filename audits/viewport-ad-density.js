const {auditNotApplicable} = require('../utils/builder');
const {Audit} = require('lighthouse');
const {boxViewableArea} = require('../utils/geometry');

/** @inheritDoc */
class ViewportAdDensity extends Audit {
  /**
   * @return {AuditMetadata}
   * @override
   */
  static get meta() {
    return {
      id: 'viewport-ad-density',
      title: 'Ad density inside the viewport',
      description: 'The ads-to-content ratio inside the viewport can have ' +
          'an impact on user experience and ultimately user retention.',
      requiredArtifacts: ['ViewportDimensions', 'RenderedAdSlots'],
    };
  }

  /**
   * @override
   * @param {Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const viewport = artifacts.ViewportDimensions;
    const slots = artifacts.RenderedAdSlots;

    if (!slots.length) {
      return auditNotApplicable('No slots on page.');
    }
    // Checks that non-null (visible) slots exist in array.
    if (!slots.find((s) => s != null)) {
      return auditNotApplicable('No visible slots on page.');
    }

    const adArea = slots.reduce((sum, slot) =>
      sum + boxViewableArea(slot, viewport), 0);
    // NOTE(gmatute): consider using content width instead of viewport
    const viewArea = viewport.innerWidth * viewport.innerHeight;

    if (viewArea <= 0) {
      throw new Error('viewport area is zero');
    }

    return {
      score: adArea / viewArea > 0.25 ? 0 : 1,
      rawValue: Math.min(adArea / viewArea, 1),
      displayValue: adArea ?
        `${Math.floor(100 * adArea / viewArea)}% covered by ads` : '',
    };
  }
}

module.exports = ViewportAdDensity;
