import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-8 text-center"
          style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f3e5f5 50%, #e8f4fd 100%)' }}>
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            アプリが正常に動作できませんでした。<br />
            ページを更新してやり直してください。
          </p>
          <pre className="text-xs text-red-400 bg-red-50 rounded-xl p-3 mb-6 text-left max-w-sm w-full overflow-auto">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold"
          >
            ページを更新する
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
