// ApiModal 组件配置常量
export const DATA_TYPE_CONFIG = {
    UserDB: {
        metricsCategory: '用户数据',
        defaultMetrics: ['cpu_time'],
        defaultTopMetric: 'cpu_time',
        requiresUserList: true
    },
    topdata: {
        metricsCategory: 'CPU占用',
        defaultMetrics: ['cpu_time'],
        defaultTopMetric: 'cpu_time'
    },
    UserInfo: {
        metricsCategory: '登录信息',
        defaultMetrics: ['jcpu'],
        defaultTopMetric: 'jcpu'
    },
    topsummary: {
        metricsCategory: 'TOP信息',
        defaultMetrics: ['users']
    },
    lao_tjusages: {
        metricsCategory: '作业与用户信息',
        defaultMetrics: ['job_num'],
        defaultTopMetric: 'job_num'
    },
    lao_pestat: {
        metricsCategory: 'CPU与内存资源信息',
        defaultMetrics: ['cpu_usages'],
        defaultTopMetric: 'cpu_usages'
    },

    pestat_data: {
        metricsCategory: '节点资源详情',
        defaultMetrics: ['CPU_use'],
        defaultTopMetric: 'CPU_use'
    },
    pestat_nodefx: {
        metricsCategory: '节点资源分布信息',
        defaultMetrics: ['idle_num'],
        defaultTopMetric: 'idle_num'
    },
    squeue_data: {
        metricsCategory: '作业队列详情',
        defaultMetrics: ['job_status'],
        defaultTopMetric: 'job_status'
    },
    lao_tjnodes: {
        metricsCategory: '节点资源信息',
        defaultMetrics: ['node_total'],
        defaultTopMetric: 'node_total'
    },
    lao_tjstorage: {
        metricsCategory: '存储资源信息',
        defaultMetrics: ['r_storageused'],
        defaultTopMetric: 'r_storageused'
    }
}

export const API_TYPE_CONFIG = {
    topValues: {
        requiresTopCount: true,
        requiresTopMetric: true
    },
    averageValues: {
        requiresTopCount: false,
        requiresTopMetric: false
    },
    timeValues: {
        requiresGranularity: true
    }
}

export const GRANULARITY_OPTIONS = [
    {value:'0',label:'自动识别'},
    {value:'60',label:'1分钟'},
    {value:'300',label:'5分钟'},
    {value:'3600',label:'1小时'},
    {value:'86400',label:'1天'}
]

export const COMPARE_OPTIONS = [
    {value:'>',label:'>'},
    {value:'<',label:'<'},
    {value:'>=',label:'>='},
    {value:'<=',label:'<='}
]

export const ANIMATE_OPTIONS = [
    {value: '1',label: '是'},
    {value: '0',label: '否'}
]

export const PREDEFINE_COLORS = [
    '#ff4500','#ff8c00','#ffd700','#90ee90','#00ced1',
    '#1e90ff','#c71585','rgba(255, 69, 0, 0.68)',
    'rgb(255, 120, 0)','hsv(51, 100, 98)',
    'hsva(120, 40, 94, 0.5)','hsl(181, 100%, 37%)',
    'hsla(209, 100%, 56%, 0.73)','#c7158577'
]

export const LOCAL_DATA_URLS = {
    "lao_pestat": "/NetInside/js/local_lao_pestat.json",
    "lao_tjnodes": "/NetInside/js/local_lao_tjnodes.json",
    "lao_tjstorage": "/NetInside/js/local_lao_tjstorage.json",
    "lao_tjusages": "/NetInside/js/local_lao_tjusages.json",
    "pestat_data": "/NetInside/js/pestat_data.json",
                "pestat_nodefx": "/NetInside/js/pestat_nodefx.json",
                "squeue_data": "/NetInside/js/squeue_data.json",
    "UserDB": "/NetInside/js/local_Usermetrics.json",
    "topdata": "/NetInside/js/local_TopDatametrics.json",
    "UserInfo": "/NetInside/js/local_UserInfometrics.json",
    "topsummary": "/NetInside/js/local_TopSummaryDatametrics.json"
}

export const OBJECT_LABEL_MAP = {
    'Prefix24': '网段',
    'BusinessGroup': '工作组',
    'VLAN': 'VLAN',
    'WebApplication': '业务',
    'MonInterfaceGroup': '监控口',
    'ClientBusinessGroup': '用户组'
}

export const EXCLUDE_OBJECT_KEYS = ['ISPAS', 'DestAS', 'BusinessGroupLink', 'Interface', 'User']

export const BUSINESS_TYPES = ['WebApplication', 'PageFamily', 'User', 'ClientBusinessGroup']

export const BUSINESS_METRICS = ['业务网络', '业务访问', '业务性能', '响应代码']

export const SINGLE_METRICS_TYPES = [
    'hengxiangzhuzhuangtu','zongxiangzhuzhuangtu','jinduhuantu','yibiaopan',
    'meiguitu','bingtu','shixinbingtu','shuzitu'
]

export const EXCLUDE_METRICS_TYPES = ['lao_pestat', 'lao_tjnodes', 'lao_tjstorage', 'lao_tjusages', 'pestat_data', 'pestat_nodefx', 'squeue_data'] 