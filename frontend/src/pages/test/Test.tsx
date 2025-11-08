import { useState, useEffect } from 'react'

function Test() {
    const [backendData, setBackendData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [selectedEndpoint, setSelectedEndpoint] = useState<'users' | 'products'>('users')

    const fetchData = (endpoint: 'users' | 'products') => {
        setLoading(true)
        setError('')

        fetch(`/api/${endpoint}`)
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
        fetchData(selectedEndpoint)
    }, [selectedEndpoint])

    if (loading) {
        return <div className="container">正在加载用户数据...</div>
    }

    return (
        <div className="container">
            <h1>API 数据查看器</h1>

            <div className="controls">
                <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value as 'users' | 'products')}
                    className="endpoint-selector"
                >
                    <option value="users">用户列表 (/api/users)</option>
                    <option value="products">商品列表 (/api/products)</option>
                </select>
            </div>

            {error ? (
                <div className="error">
                    <h3>加载失败</h3>
                    <p>错误: {error}</p>
                </div>
            ) : (
                <div className="data-viewer">
                    <h3>后端返回的原始数据</h3>
                    <pre>{JSON.stringify(backendData, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

export default Test