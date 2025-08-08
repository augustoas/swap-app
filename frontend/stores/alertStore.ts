import { type IAlert } from '@/types/alert'

const createInitialState = (): IAlert => {
  const initialAlert: IAlert = {
    status: false,
    type: '',
    message: '',
    color: '',
    icon: '',
    title: '',
    location: 'top'
  };
  return initialAlert;
}

export const useAlertStore = defineStore('AlertStore', {
  state: (): {alert: IAlert} => {
    return {
      alert: createInitialState()
    }
  },
  getters: {
    getAlert(): IAlert {
      return this.alert;
    },
  },
  actions: {
    setAlert(type: string, message: string | string[] = '', location: "top" | "bottom" | "center" = "top") {
      const types = ['success', 'info', 'warning', 'error']
      const titles = ['Éxito', 'Información', 'Advertencia', 'Error']
      if (types.includes(type)) this.alert.title = titles[types.indexOf(type)]
      this.alert.status = true;
      this.alert.type = type;
      this.alert.message = message;
      this.alert.color = type;
      this.alert.icon = '$' + type;
      this.alert.location = location;
    }
  },
})