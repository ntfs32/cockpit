/*jshint esversion: 6 */
/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */
import { logDebug } from '../machines/helpers.es6';

// TODO: consider immutableJS
// TODO: reducers share common code - generalize

function hostsReducer (state, action) {
    state = state || {}; // object of 'hostId: host'

    switch (action.type) {
        case 'OVIRT_UPDATE_HOST':
        {
            const newState = Object.assign({}, state);
            newState[action.payload.id] = newState[action.payload.id] || {};
            Object.assign(newState[action.payload.id], action.payload); // merge instead of replace, is it as expected?
            return newState;
        }
        case 'OVIRT_REMOVE_UNLISTED_HOSTS':
        {
            const newState = Object.assign({}, state);
            const allHostIds = action.payload.allHostIds;
            const toBeRemoved = Object.getOwnPropertyNames(newState).filter(hostId => (allHostIds.indexOf(hostId) < 0));
            toBeRemoved.forEach(hostId => delete newState[hostId]);
            return newState;
        }
        default:
            return state;
    }
}

function clustersReducer (state, action) {
    state = state || {}; // object of 'clusterId: cluster'

    switch (action.type) {
        case 'OVIRT_UPDATE_CLUSTER':
        {
            const newState = Object.assign({}, state);
            newState[action.payload.id] = newState[action.payload.id] || {};
            Object.assign(newState[action.payload.id], action.payload); // merge instead of replace, is it as expected?
            return newState;
        }
        case 'OVIRT_REMOVE_UNLISTED_CLUSTERS':
        {
            const newState = Object.assign({}, state);
            const allIds = action.payload.allClusterIds;
            const toBeRemoved = Object.getOwnPropertyNames(newState).filter(id => (allIds.indexOf(id) < 0));
            toBeRemoved.forEach(id => delete newState[id]);
            return newState;
        }
        default:
            return state;
    }
}

function iconsReducer (state, action) {
    state = state || {}; // object of 'iconId: icon'

    switch (action.type) {
        case 'OVIRT_UPDATE_ICON':
        {
            const newState = Object.assign({}, state);
            newState[action.payload.id] = newState[action.payload.id] || {};
            Object.assign(newState[action.payload.id], action.payload); // merge instead of replace, is it as expected?
            return newState;
        }
        default:
            return state;
    }
}

function configReducer (state, action) {
    state = state || {
            loginInProgress: true,
        };

    switch (action.type) {
        case 'OVIRT_LOGIN_IN_PROGRESS':
        {
            return Object.assign({}, state, { loginInProgress: action.payload.loginInProgress });
        }
        default:
            return state;
    }
}

function vmsReducer (state, action) {
    state = state || {}; // object of 'vmId: vm'

    switch (action.type) {
        case 'OVIRT_UPDATE_VM':
        {
            const newState = Object.assign({}, state);
            newState[action.payload.id] = newState[action.payload.id] || {};
            Object.assign(newState[action.payload.id], action.payload); // merge instead of replace, is it as expected?
            return newState;
        }
        case 'OVIRT_REMOVE_UNLISTED_VMS':
        {
            const newState = Object.assign({}, state);
            const allVmsIds = action.payload.allVmsIds;
            const toBeRemoved = Object.getOwnPropertyNames(newState).filter(vmId => (allVmsIds.indexOf(vmId) < 0));
            toBeRemoved.forEach(vmId => delete newState[vmId]);
            return newState;
        }
        case 'VM_ACTION_FAILED': // this reducer seconds the implementation in cockpit:machines (see the 'vms' reducer there).
        { // If an action failed on a VM running on this host, the error will be recorded on two places - it's as expected.
            // If the VM is unknown for this host, the user needs to be still informed about the result
            // So far, the VM is identified by "name" only
            // See the templatesReducer() as well.
            const vmId =  Object.getOwnPropertyNames(state).filter(vmId => state[vmId].name === action.payload.name);
            if (!vmId) {
                return state;
            }

            const updatedVm = Object.assign({}, state[vmId],
                {lastMessage: action.payload.message, lastMessageDetail: action.payload.detail});
            const updatedPartOfState = {};
            updatedPartOfState[vmId] = updatedVm;
            const newState = Object.assign({}, state, updatedPartOfState);
            return newState;
        }
        default:
            return state;
    }
}

function templatesReducer (state, action) {
    state = state || {}; // object of 'templateId: template'

    switch (action.type) {
        case 'OVIRT_UPDATE_TEMPLATE':
        {
            const newState = Object.assign({}, state);
            newState[action.payload.id] = newState[action.payload.id] || {};
            Object.assign(newState[action.payload.id], action.payload); // merge instead of replace, is it as expected?
            return newState;
        }
        case 'OVIRT_REMOVE_UNLISTED_TEMPLATES':
        {
            const newState = Object.assign({}, state);
            const allTemplateIds = action.payload.allTemplateIds;
            const toBeRemoved = Object.getOwnPropertyNames(newState).filter(id => (allTemplateIds.indexOf(id) < 0));
            toBeRemoved.forEach(id => delete newState[id]);
            return newState;
        }
        case 'VM_ACTION_FAILED': // this reducer seconds the implementation in cockpit:machines and the vmsReducer()
        {
            logDebug(`templateReducer() VM_ACTION_FAILED payload: ${JSON.stringify(action.payload)}`);
            if (action.payload.extraPayload && action.payload.extraPayload.templateName) {
                const templateId = Object.getOwnPropertyNames(state).filter(templateId => state[templateId].name === action.payload.extraPayload.templateName);
                const updatedTemplate = Object.assign({}, state[templateId], {
                    lastMessage: action.payload.message,
                    lastMessageDetail: action.payload.detail
                });
                const updatedPartOfState = {};
                updatedPartOfState[templateId] = updatedTemplate;
                const newState = Object.assign({}, state, updatedPartOfState);
                logDebug(`templateReducer() VM_ACTION_FAILED: ${JSON.stringify(newState)}`);
                return newState;
            }
            return state;
        }
        default:
            return state;
    }
}

function routerReducer (state, action) {
    state = state || {
        route: 'hostvms',
    };

    switch (action.type) {
        case 'OVIRT_GOTO_SUBPAGE': {
            return Object.assign({}, state, {route: action.payload.target});
        }
        default:
            return state;
    }
}

function callSubReducer (newState, action, subreducer, substateName) {
    const newSubstate = subreducer(newState[substateName], action);
    if (newState[substateName] !== newSubstate) {
        const temp = {};
        temp[substateName] = newSubstate;
        newState = Object.assign({}, newState, temp);
    }
    return newState;
}

export function ovirtReducer (state, action) {
    state = state || {
            hosts: {}, // {id:host}
        };

    let newState = state;
    newState = callSubReducer(newState, action, hostsReducer, 'hosts');
    newState = callSubReducer(newState, action, vmsReducer, 'vms');
    newState = callSubReducer(newState, action, templatesReducer, 'templates');
    newState = callSubReducer(newState, action, clustersReducer, 'clusters');
    newState = callSubReducer(newState, action, iconsReducer, 'icons');
    newState = callSubReducer(newState, action, configReducer, 'ovirtConfig');
    newState = callSubReducer(newState, action, routerReducer, 'router');

    return newState;
}
