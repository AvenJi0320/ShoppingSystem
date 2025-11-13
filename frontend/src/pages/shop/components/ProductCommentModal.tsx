import { Modal, Button, Space, TextArea } from '@douyinfe/semi-ui';
import { useUserStore } from '../../../store/userStore';
import { useState, useEffect } from 'react';

interface Comment {
  comment_id: number;
  user_id: number;
  product_id: number;
  score: number;
  content: string | null;
  create_time: string;
  user: {
    user_id: number;
    phone: string;
    email: string | null;
  };
}

interface ProductCommentModalProps {
  visible: boolean;
  onClose: () => void;
  productId: number;
}

const ProductCommentModal = ({ visible, onClose, productId }: ProductCommentModalProps) => {
  const { user_id } = useUserStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);

  // 获取评论列表
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (user_id) {
        params.append('user_id', user_id.toString());
      }
      
      const response = await fetch(`/api/comments/product/${productId}?${params}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setComments(result.data);
      } else {
        setError(result.message || '获取评论失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('获取评论失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 当模态框显示或用户ID改变时重新获取评论
  useEffect(() => {
    if (visible && productId) {
      fetchComments();
    }
  }, [visible, productId, user_id]);

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user_id) {
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: user_id,
          content: commentText.trim(),
          score: rating,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // 清空输入框和重置评分
        setCommentText('');
        setRating(5);
        // 重新获取评论列表
        fetchComments();
      } else {
        alert(result.message || '提交评论失败');
      }
    } catch (err) {
      alert('网络请求失败');
      console.error('提交评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!user_id) {
      alert('请先登录');
      return;
    }

    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}?user_id=${user_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        // 重新获取评论列表
        fetchComments();
        alert('评论删除成功');
      } else {
        alert(result.message || '删除评论失败');
      }
    } catch (err) {
      alert('网络请求失败');
      console.error('删除评论失败:', err);
    }
  };

  // 渲染评分星星（只读）
  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < score ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  // 渲染可点击的评分星星
  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-2xl cursor-pointer transition-colors hover:scale-110 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setRating(index + 1)}
        style={{ marginRight: '4px' }}
      >
        ★
      </span>
    ));
  };

  // 渲染评论列表
  const renderCommentsList = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          加载评论中...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          暂无评论
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.comment_id} className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">
                  用户ID: {comment.user_id}
                </span>
                {/* 只有当前登录用户才能删除自己的评论 */}
                {user_id && comment.user_id === user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2 px-2 py-1 rounded border border-red-300 hover:border-red-500 transition-colors"
                    title="删除评论"
                  >
                    删除
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {renderStars(comment.score)}
              </div>
            </div>
            {comment.content && (
              <p className="text-gray-700 mb-2">{comment.content}</p>
            )}
            <div className="text-xs text-gray-500">
              {new Date(comment.create_time).toLocaleString('zh-CN')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title="商品评论"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="p-4">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            当前用户: {user_id ? `ID: ${user_id}` : '未登录'}
          </p>
        </div>
        
        {/* 评论列表 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">用户评论</h3>
          {renderCommentsList()}
        </div>
        
        {/* 评论输入框 */}
        {user_id && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium mb-3">发表评论</h4>
            <Space vertical className="w-full">
              <div className="mb-2">
                <span className="text-sm text-gray-600 mr-2">评分：</span>
                {renderInteractiveStars()}
                <span className="text-sm text-gray-600 ml-2">({rating}星)</span>
              </div>
              <TextArea
                placeholder="请输入您的评论..."
                value={commentText}
                onChange={(value) => setCommentText(value)}
                rows={3}
                maxLength={500}
                showClear
              />
              <Button
                type="primary"
                onClick={handleSubmitComment}
                loading={submitting}
                disabled={!commentText.trim()}
              >
                发表评论
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductCommentModal;