import Cookies from 'js-cookie'
import axios from '@/lib/apirequest'
import config from '@/config'
import { forEach, hasOneOf, objEqual } from '@/lib/tools'
const { title, cookieExpires, useI18n } = config

export const TOKEN_KEY = 'token'
// 设置token或者其他值
export const setToken = (key,value) =>{
	// Cookies.set(key, value, { expires: cookieExpires || 1 })
	
}

export const getToken = (key) => {
  const value = Cookies.get(key)
  if (value) return value
  else return false
}

// 本地数据存储
export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

export const localRead = (key) => {
  return localStorage.getItem(key) || ''
}

// /**
//  * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
//  * @param {*} route 路由列表
//  */

// const hasAccess = (access, route) => {
//   if (route.meta && route.meta.name) return hasOneOf(access, route.meta.access)
//   else return true
// }

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes)=>{
	// const routePermissionJudge = (list) => {
 //    return list.some(item => {
 //      if (item.children && item.children.length) {
 //        return routePermissionJudge(item.children)
 //      } else if (item.name === name) {
 //        return true;
 //      } else{
 //        return false;
 //      }
 //    })
 //  }
  // return routePermissionJudge(routes);
  return true;
}

export const getRouteTitleHandled = (route) => {
  let router = { ...route }
  let meta = { ...route.meta }
  let title = ''
  if (meta.title) {
    if (typeof meta.title === 'function') {
      meta.__titleIsFunction__ = true
      title = meta.title(router)
    } else title = meta.title
  }
  meta.title = title
  router.meta = meta
  return router
}

export const showTitle = (item, vm) => {
  let { title, __titleIsFunction__ } = item.meta
  if (!title) return
  if (useI18n) {
    if (title.includes('{{') && title.includes('}}') && useI18n) title = title.replace(/({{[\s\S]+?}})/, (m, str) => str.replace(/{{([\s\S]*)}}/, (m, _) => vm.$t(_.trim())))
    else if (__titleIsFunction__) title = item.meta.title
    else title = vm.$t(item.name)
  } else title = (item.meta && item.meta.title) || item.name
  return title
}

// scrollTop animation
export const scrollTop = (el, from = 0, to, duration = 500, endCallback) => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60)
      }
    )
  }
  const difference = Math.abs(from - to)
  const step = Math.ceil(difference / duration * 50)

  const scroll = (start, end, step) => {
    if (start === end) {
      endCallback && endCallback()
      return
    }

    let d = (start + step > end) ? end : start + step
    if (start > end) {
      d = (start - step < end) ? end : start - step
    }

    if (el === window) {
      window.scrollTo(d, d)
    } else {
      el.scrollTop = d
    }
    window.requestAnimationFrame(() => scroll(d, end, step))
  }
  scroll(from, to, step)
}

/**
 * @description 根据当前跳转的路由设置显示在浏览器标签的title
 * @param {Object} routeItem 路由对象
 * @param {Object} vm Vue实例
 */
export const setTitle = (routeItem, vm) => {
  const handledRoute = getRouteTitleHandled(routeItem)
  const pageTitle = showTitle(handledRoute, vm)
  const resTitle = pageTitle ? `${title} - ${pageTitle}` : title
  window.document.title = resTitle
}



