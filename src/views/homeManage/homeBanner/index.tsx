import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, SpinProps, Tooltip, Image, Modal, message } from 'antd'
import { SyncOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import SearchPannel from '@/components/SearchPannel'
import BannerEdit from './components/Edit'
import { getHomeBanner, updateBannerStatus, deleteBanner } from '@/api'
import type { SearchFormProps } from '@/components/SearchPannel'
export interface BannerProps {
  key?: number;
  bannerId?: number;
  desc: string;
  imageUrl: string;
  status?: string,
  sort?: number;
}

export interface paginationProps {
  current: number;
  pageSize: number | undefined;
  total: number;
  pageSizeOptions?: string[];
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
}

const HomeBanner: React.FC = (props: any) => {
  const [loading, setLoading] = useState<boolean | SpinProps | undefined>(false)
  const [tableData, setTableData] = useState<BannerProps[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [pageType, setPageType] = useState<string>()
  const [refresh, setRefresh] = useState<boolean>()
  const [detail, setDetail] = useState<BannerProps>({
    desc: '',
    imageUrl: ''
  })
  const [pagination, setPagination] = useState<paginationProps>({
    current: 1,
    pageSize: 5,
    total: 0,
    pageSizeOptions: ['5', '10', '20'],
    showQuickJumper: true,
    showSizeChanger: true
  })
  const [searchParams, setSearchParams] = useState({})

  useEffect(() => {
    const getList = async () => {
      const params = {
        ...searchParams,
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      }
      setLoading(true)
      try {
        let { data: { list, pageData: { pageNo, pageSize, total } } } = await getHomeBanner(params, { noLoading: true })
        const rows = list.map((it: any) => ({
          ...it,
          key: it.bannerId
        }))
        setTableData(rows)
        setPagination({
          ...pagination,
          current: pageNo,
          pageSize,
          total
        })
      } catch (error) { console.log(error);
      }
      setLoading(false)
    }
    getList()
  }, [refresh])

  // ??????|??????
  const onEditVisible = (show: boolean, data?: BannerProps): void => {
    setVisible(show)
    setPageType(data ? 'EDIT' : 'ADD')
    if (data) {
      setDetail(data)
    } else {
      setDetail({
        imageUrl: '',
        desc: ''
      })
    }
  }

  // ??????
  const handleRefresh = (): void => {
    setVisible(false)
    setRefresh(!refresh)
  }

  // ??????
  const onSearch = (values: any) => {
    console.log(values);
    setSearchParams(values)
    setRefresh(!refresh)
  }

  // ????????????
  const onChangeStatus = (record: any) => {
    const { bannerId, status } = record
    Modal.confirm({
      title: `${status === 0 ? '??????' : '??????'}??????`,
      icon: <ExclamationCircleOutlined />,
      content: `??????${status === 0 ? '??????' : '??????'}????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: async () => {
        await updateBannerStatus({ bannerId, status: status === 0 ? 1 : 0 })
        message.success('????????????')
        setRefresh(!refresh)
      }
    })
  }

  // ??????
  const onDelete = (record: any) => {
    const { bannerId } = record
    Modal.confirm({
      title: '????????????',
      icon: <ExclamationCircleOutlined />,
      content: `????????????????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: async () => {
        await deleteBanner({ bannerId })
        message.success('????????????')
        setRefresh(!refresh)
      }
    })
  }

  // ??????
  const onPageChange = (page: number, pageSize?: number | undefined) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize
    })
    setRefresh(!refresh)
  }

  const extra = (
    <>
      <Button type="primary" shape="round" icon={<PlusOutlined />} className="ml-10"
        onClick={() => onEditVisible(true)}
      >
        ??????
      </Button>
      <Button shape="round" icon={<SyncOutlined />} className="ml-10"
        onClick={handleRefresh}
      >
        ??????
      </Button>
    </>
  )

  const columns: ColumnsType<BannerProps> = [
    {
      title: '??????',
      dataIndex: 'index',
      key: 'index',
      width: 100,
      render: (text: string, record, index) => <a>{index + 1}</a>,
    },
    {
      title: '??????ID',
      dataIndex: 'bannerId',
      width: 100,
    },
    {
      title: '??????',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 200,
      render: imageUrl => (
        <Image
          width={100}
          height={50}
          src={imageUrl}
        />
      ),
    },
    {
      title: '????????????',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: {
        showTitle: false,
      },
      render: desc => (
        <Tooltip placement="top" title={desc}>
          {desc}
        </Tooltip>
      ),
    },
    {
      title: '????????????',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text: any, record: any) => {
        return record.createTime
      }
    },
    {
      title: '??????',
      dataIndex: 'sort',
      key: 'sort',
      width: 120
    },
    {
      title: '??????',
      dataIndex: 'status',
      key: 'sort',
      width: 120,
      render: (text: any, record: any) => {
        return record.status === 0 ? '?????????' : '?????????'
      }
    },
    {
      title: '??????',
      key: 'action',
      width: 200,
      render: (text: any, record: any) => {
        const { status } = record
        return (
          <Space size={0}>
            <Button type="link" onClick={() => onEditVisible(true, record)}>??????</Button>
            <Button type="link" onClick={() => onChangeStatus(record)}>{status === 0 ? '??????' : '??????'}</Button>
            <Button type="link" danger onClick={() => onDelete(record)}>??????</Button>
          </Space>
        )
      },
    },
  ]

  const searchFormList: Array<SearchFormProps> = [
    {
      type: 'INPUT',
      label: '??????ID',
      field: 'bannerId'
    },
    {
      type: 'INPUT',
      label: '????????????',
      field: 'desc',
    },
    {
      type: 'SELECT',
      label: '??????',
      field: 'status',
      initialValue: '',
      options: [
        { value: '', label: '??????'},
        { value: 1, label: '?????????'},
        { value: 0, label: '?????????'}
      ]
    }
  ]

  return (
    <>
      <SearchPannel searchFormList={searchFormList} onSearch={onSearch} />
      <Card
        title="??????????????????"
        extra={extra}
      >
        <Table<BannerProps>
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: onPageChange,
          }}
        />
      </Card>
      <BannerEdit
        visible={visible}
        pageType={pageType}
        detail={detail}
        onCancel={() => onEditVisible(false)}
        onSuccess={handleRefresh}
      />
    </>
  );
}

export default HomeBanner