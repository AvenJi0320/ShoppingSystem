import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendData, setBackendData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchUsers = () => {
    setLoading(true)
    setError('')
    
    fetch('/api/users')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setBackendData(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return <div className="container">正在加载用户数据...</div>
  }

  return (
    <div className="container">
      <h1>用户列表</h1>
      
      {error ? (
        <div className="error">
          <h3>加载失败</h3>
          <p>错误: {error}</p>
          <button onClick={fetchUsers}>重新加载</button>
        </div>
      ) : (
        <div className="users-list">
          <h3>后端返回的值</h3>
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
          <button onClick={fetchUsers}>刷新数据</button>
        </div>
      )}
    </div>
  )
}

export default App