import React from 'react';

/**
 * Error boundary: if anything inside fails to render (for example, content
 * saved in an unexpected shape), the rest of the page still renders.
 * `fallback` defaults to rendering nothing.
 */
export default class SafeSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev) {
    // Reset when navigating to another page
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
