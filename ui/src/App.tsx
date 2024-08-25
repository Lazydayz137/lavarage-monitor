import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button, Col, Row, Space, Statistic, Table } from 'antd';
import { Monitoring } from '../../types/monitoring';
import { LinkOutlined } from '@ant-design/icons';

function App() {
  const [monitor, setMonitor] = useState<Monitoring>({
    meta: {
      liquidationGasRemain: 0,
      utilization: 0,
      deployed: 0,
      oracleGasRemain: 0,
      openedPositions: 0,
    },
    positions: [],
    activePairsSet: []
  });

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:30001/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMonitor(data);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      <Row>
        <Col span={12}>
          <div>
            <h1>Lavarave.wtf Monitor</h1>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <h2>Dashboard</h2>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
        <Statistic title="Open Positions" value={monitor.meta.openedPositions} />
        </Col>
        <Col span={6}>
        <Statistic title="Utilization (%)"  value={(monitor.meta.utilization/(monitor.meta.deployed + monitor.meta.utilization) * 100).toFixed(2)} />
        </Col>
        <Col span={6}>
        <Statistic title="Liquidation Gas (SOL)" value={monitor.meta.liquidationGasRemain} />
        </Col>
        <Col span={6}>
        <Statistic title="Pairs trading" value={monitor.activePairsSet.length} />
        </Col>
      </Row>
      <Row style={{ marginTop: '20px' }}>
        <Col span={24}>
          <h2>Positions</h2>
          <Table dataSource={monitor.positions.filter(p => p.amountInQT > 0)} rowKey={(record) => `${record.baseCoin.address}-${record.quoteCoin.address}-${record.ltv}-${record.amountInQT}`}>
            <Table.Column title="Base Coin" dataIndex={['baseCoin', 'name']} key="baseCoin" />
            <Table.Column title="Quote Coin" dataIndex={['quoteCoin', 'name']} key="quoteCoin" />
            <Table.Column 
              title="LTV" 
              dataIndex="ltv" 
              key="ltv" 
              render={(ltv) => `${(ltv * 100).toFixed(2)}%`}
              sorter={(a, b) => a.ltv - b.ltv}
            />
            <Table.Column 
              title="Borrowed" 
              dataIndex="amountInQT" 
              key="amountInQT" 
              render={(amount) => amount.toFixed(4)}
            />
            <Table.Column 
              title="Collateral" 
              dataIndex="amountInBT" 
              key="amountInBT" 
              render={(amount) => amount.toFixed(4)}
            />
            
            <Table.Column 
              title="Position Age" 
              dataIndex="elapsed" 
              key="elapsed" 
              render={(time) => `${(time / 3600).toFixed(2)} hours`}
            />
            <Table.Column 
              title="Last Interest Collection" 
              dataIndex="lastInterestCollectionElapsed" 
              key="lastInterestCollectionElapsed" 
              render={(time) => {
                const days = time / (24 * 3600);
                if (days > 365) {
                  return '--';
                } else {
                  return `${days.toFixed(2)} days ago`;
                }
              }}
            />
            <Table.Column
              title="Actions"
              key="actions"
              render={(_, record) => (
                <Space size="middle">
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(`https://solscan.io/account/${record.address}`, '_blank')}
                  />
                </Space>
              )}
            />
          </Table>
        </Col>
      </Row>
    </>
  )
}

export default App
