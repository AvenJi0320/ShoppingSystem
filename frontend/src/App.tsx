import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendData, setBackendData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/health')

  const endpoints = [
    { path: '/api/health', label: '健康检查' },
    { path: '/api/test', label: '测试数据' }
  ]

  const fetchData = (endpoint: string) => {
    setLoading(true)
    setError('')
    
    fetch(endpoint)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setBackendData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData(selectedEndpoint)
  }, [selectedEndpoint])

  if (loading) {
    return <div className="container">正在连接后端...</div>
  }

  return (
    <div className="container">
      <h1>前后端连通测试</h1>
      
      <div className="endpoint-selector">
        <label>选择API端点: </label>
        <select 
          value={selectedEndpoint} 
          onChange={(e) => setSelectedEndpoint(e.target.value)}
        >
          {endpoints.map(endpoint => (
            <option key={endpoint.path} value={endpoint.path}>
              {endpoint.label} ({endpoint.path})
            </option>
          ))}
        </select>
      </div>
      
      {error ? (
        <div className="error">
          <h3>连接失败</h3>
          <p>错误: {error}</p>
        </div>
      ) : (
        <div className="success">
          <h3>后端返回的数据:</h3>
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
        </div>
      )}
      
      <button onClick={() => fetchData(selectedEndpoint)}>
        重新测试连接
      </button>
    </div>
  )
}

export default App