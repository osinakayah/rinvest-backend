const ProjectArchive = require('../models').ProjectArchive;
const ProjectSubmission = require('../models').ProjectSubmission;
const Team = require('../models').Team;
const User = require('../models').User;
const Project = require('../models').Project;
const companyService = require('../services/company');
const notificationService = require('../services/notifications');
const projectService = require('../services/projects');
const { Op } = require('sequelize');
const search = require('../utils/search');
const { sequelize } = require('../models');
const i18n = require('i18n');
const Models = require('../models');

const dbUserInclude = {
  model: User,
  as: 'User',
  include: [
    {
      model: Models.Credential,
      as: 'Credential',
      attributes: ['email'],
    },
  ],
};

const SubmissionsService = (function () {
  const parseEvaluations = (
    rawEvaluations,
    projectId,
    companyId,
    archiveId,
  ) => {
    if (Array.isArray(rawEvaluations)) {
      return rawEvaluations.map((single) => {
        if (!single.hasOwnProperty('projectId')) {
          return {
            projectId,
            userId: single.userId,
            judgeName: single.judgeName,
            review: single.review,
            feedback: single.feedback,
            score: single.score,
            companyId,
            archiveId,
            examinationFlags: single.examinationFlags,
          };
        }

        return single;
      });
    }
  };
  const updateSubmission = async (
    submissionId,
    submissionData,
    userId,
    req,
  ) => {
    const currentSubmission = await getSubmission(submissionId, req);

    const { title, comment, category } = currentSubmission.record.meta;

    if (currentSubmission) {
      await ProjectArchive.update(
        {
          score: submissionData.score,
          examinationStatus: submissionData.examinationStatus,
          result: submissionData.result,
        },
        {
          where: {
            id: submissionId,
          },
        },
      );

      const project = await projectService.getProject(
        currentSubmission.projectId,
        req,
      );
      const evaluations = parseEvaluations(
        submissionData.evaluations,
        currentSubmission.projectId,
        project.companyId,
        submissionId,
      );

      await ProjectSubmission.destroy({
        where: {
          projectId: project.id,
          archiveId: currentSubmission.id,
        },
      });

      await ProjectSubmission.bulkCreate(evaluations);

      await notificationService.createNotification(
        project.companyId,
        {
          senderId: userId,
          actionData: {},
          actionText: i18n.__(`%sの審査結果が出ました`, project.name),
          notificationType: 'other',
          meta: {
            projectId: project.id,
            type: notificationService.notificationMetaType
              .projectSubmissionReview,
            submissionId,
            projectName: project.name,
            category: category ? category : '',
            title: title,
            comment: comment,
            score: submissionData.score,
            result: submissionData.result,
            review: submissionData.review,
            feedback: submissionData.feedback,
          },
          companyId: project.companyId,
          message: i18n.__(`%sの審査結果が出ました`, project.name),
          projectId: project.id,
          receiverId: project.userId,
        },
        req,
      );
    }
  };
  const deleteSubmission = async (submissionId) => {
    return await ProjectArchive.destroy({ where: { id: submissionId } });
  };

  const getSubmission = async (submissionId, req) => {
    return ProjectArchive.findOne_rls(req, {
      where: {
        id: submissionId,
      },
      include: [
        {
          model: ProjectSubmission,
          as: 'Evaluations',
          include: dbUserInclude,
        },
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
          include: [
            {
              model: Team,
              as: 'Team',
              include: [
                {
                  model: User,
                  as: 'User',
                  include: [
                    {
                      model: Models.Credential,
                      as: 'Credential',
                      attributes: ['email'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  };

  const getAllSubmissions = async (companyId, query, req) => {
    const {
      page,
      filter,
      batches,
      limit = parseInt(process.env.PAGE_SIZE),
      ...queryParams
    } = query;
    const offset = page * limit;
    let projects = await companyService.getCompanyProjects(companyId, req);

    if (batches && batches.length > 0) {
      projects = projects.filter((o) => {
        if (o && o.Batch && o.Batch.id) return batches.indexOf(o.Batch.id) > -1;
      });
    }

    const projectIds = projects.map((p) => p.id);

    if (filter) {
      const subQ = search.find(filter.replace(/%20/g, ' '));

      let dbQuery = {
        [Op.and]: [
          {
            projectId: [...projectIds],
            archiveType: 'submission',
          },
          subQ,
        ],
      };

      let searchQ =
        subQ.$or && subQ.$or.length > 1
          ? Object.values(subQ.$or[1].archiveType)[0]
          : null;
      let projectIdsByUserName = [];
      let projectIdsByName = [];
      if (searchQ) {
        projectIdsByUserName =
          await projectService.getProjectsUserByNameBelongsTo(
            searchQ,
            companyId,
          );
        projectIdsByName = await projectService.getProjectIdsFromName(
          searchQ,
          companyId,
        );

        let searchProjectIds = [...projectIdsByUserName, ...projectIdsByName];

        if (batches && batches.length > 0) {
          searchProjectIds = searchProjectIds.filter((a) =>
            projectIds.includes(a),
          );
        }

        let dbQuery = {
          [Op.and]: [
            {
              projectId: searchProjectIds,
              archiveType: 'submission',
            },
            subQ,
          ],
        };

        return ProjectArchive.findAndCountAll({
          distinct: true,
          offset,
          limit,
          where: dbQuery,
          order: [['updatedAt', 'ASC']],
          include: [
            'Evaluations',
            {
              model: Project,
              as: 'Project',
              attributes: ['uuid'],
              include: [
                {
                  model: Team,
                  as: 'Team',
                  include: dbUserInclude,
                },
                'Batch',
              ],
            },
          ],
        });
      }

      dbQuery = {
        [Op.and]: [
          {
            projectId: [
              ...projectIds,
              ...projectIdsByUserName,
              ...projectIdsByName,
            ],
            archiveType: 'submission',
          },
          subQ,
        ],
      };
      let projectarch = await ProjectArchive.findAndCountAll_rls(req, {
        distinct: true,
        offset,
        limit,
        where: dbQuery,
        order: [['updatedAt', 'ASC']],
        include: [
          'Evaluations',
          {
            model: Project,
            as: 'Project',
            attributes: ['uuid'],
            include: [
              {
                model: Team,
                as: 'Team',
                include: dbUserInclude,
              },
              'Batch',
            ],
          },
        ],
      });
      return projectarch;
    }

    let project = await ProjectArchive.findAndCountAll_rls(req, {
      offset,
      limit,
      distinct: true,
      where: {
        projectId: projectIds,
        archiveType: 'submission',
        ...queryParams,
      },
      order: [['updatedAt', 'ASC']],
      include: [
        'Evaluations',
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
          include: [
            {
              model: Team,
              as: 'Team',
              include: dbUserInclude,
            },
            'Batch',
          ],
        },
      ],
    });
    return project ? project : [];
  };
  const getAllSubmissionsDownload = async (companyId, query, req) => {
    let projects = await companyService.getCompanyProjects(companyId, req);

    if (req && req.query && req.query.batches) {
      if (req.query.batches.length > 0) {
        projects = projects.filter((o) => {
          if (o && o.Batch && o.Batch.id)
            return req.query.batches.indexOf(o.Batch.id) > -1;
        });
      }
    }

    const projectIds = projects.map((p) => p.id);

    let projectarch = await ProjectArchive.findAll_rls(req, {
      where: {
        projectId: projectIds,
        archiveType: 'submission',
      },
      order: [
        ['updatedAt', 'ASC'],
        [{ model: ProjectSubmission, as: 'Evaluations' }, 'id', 'ASC'],
      ],
      include: [
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
        },
        {
          model: Team,
          as: 'Team',
          include: [
            {
              model: Models.User,
              as: 'User',
              include: [
                {
                  model: Models.Credential,
                  as: 'Credential',
                  attributes: ['email'],
                },
              ],
            },
          ],
        },
        {
          model: ProjectSubmission,
          as: 'Evaluations',
          include: dbUserInclude,
        },
      ],
    });
    return projectarch;
  };

  const getProjectReview = async (projectId, query, companyId, req) => {
    const {
      page,
      limit = process.env.PAGE_SIZE,
      filter,
      ...queryParams
    } = query;
    const offset = page * limit;

    if (filter) {
      const subQ = search.find(filter.replace(/%20/g, ' '));

      const dbQuery = {
        [Op.and]: [
          {
            projectId: projectId,
            archiveType: 'submission',
          },
          subQ,
        ],
      };
      let project = await ProjectArchive.findAndCountAll_rls(req, {
        distinct: true,
        offset,
        limit,
        where: dbQuery,
        order: [['updatedAt', 'ASC']],
        include: [
          'Evaluations',
          {
            model: Project,
            as: 'Project',
            attributes: ['uuid'],
            include: [
              {
                model: Team,
                as: 'Team',
                include: dbUserInclude,
              },
            ],
          },
        ],
      });
      return project;
    }

    let project = await ProjectArchive.findAndCountAll_rls(req, {
      distinct: true,
      offset,
      limit,
      where: {
        projectId: projectId,
        archiveType: 'submission',
        ...queryParams,
      },
      order: [['updatedAt', 'ASC']],
      include: [
        'Evaluations',
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
          include: [
            {
              model: Team,
              as: 'Team',
              include: dbUserInclude,
            },
          ],
        },
      ],
    });

    return project;
  };
  const advanceSearchSubmissions = async ({
    result,
    category,
    batches,
    projectName,
    ownerName,
    companyId,
    page,
    limit,
  }) => {
    const offset = page * limit;
    const projectIdsByUserName =
      ownerName && ownerName.length > 0
        ? await projectService.getProjectsUserByNameBelongsTo(
            ownerName,
            companyId,
          )
        : [];
    const projectIdsByName =
      projectName && projectName.length > 0
        ? await projectService.getProjectIdsFromName(projectName, companyId)
        : [];

    const searchProjectIds = [...projectIdsByUserName, ...projectIdsByName];

    const projectsIdsFilteredByBatches =
      Array.isArray(batches) && batches.length > 0
        ? await Project.findAll({
            where: {
              [Op.or]: [{ id: searchProjectIds }, { batchId: batches }],
            },
          }).map((p) => p.id)
        : searchProjectIds;

    const andQuery = [];

    if (projectsIdsFilteredByBatches.length > 0) {
      andQuery.push({
        projectId: {
          [Op.or]: projectsIdsFilteredByBatches,
        },
      });
    }

    if (category && category.length > 0) {
      andQuery.push({
        'record.meta.category': {
          [Op.or]: category,
        },
      });
    }

    if (result && result.length > 0) {
      andQuery.push({
        result: {
          [Op.or]: result,
        },
      });
    }

    let whereQuery = {
      companyId,
      archiveType: 'submission',
    };

    if (andQuery.length > 0) {
      whereQuery = {
        ...whereQuery,
        [Op.and]: andQuery,
      };
    }

    return ProjectArchive.findAndCountAll({
      offset,
      limit,
      distinct: true,
      where: whereQuery,
      order: [['updatedAt', 'DESC']],
      include: [
        'Evaluations',
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
          include: [
            {
              model: Team,
              as: 'Team',
              include: dbUserInclude,
            },
            'Batch',
          ],
        },
      ],
    });
  };
  const advanceSearchArchiveList = async ({
    category,
    archiveType,
    projectId,
    companyId,
  }) => {
    const orQuery = [];

    if (category && category.length > 0) {
      orQuery.push({
        'record.meta.category': {
          [Op.or]: category,
        },
      });
    }
    let whereQuery = {
      companyId,
      projectId,
    };

    if (archiveType) {
      orQuery.push({
        archiveType,
      });
    }
    if (orQuery.length > 0) {
      whereQuery = {
        ...whereQuery,
        [Op.or]: orQuery,
      };
    }

    const hyMap = await getHYMap();
    const projectArch = await ProjectArchive.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Project,
          as: 'Project',
          attributes: ['uuid'],
        },
        {
          model: User,
          as: 'User',
          attributes: ['name'],
        },
      ],
      where: whereQuery,
    });

    return transformPA(projectArch, hyMap);
  };
  const getHYMap = async () => {
    let hypothesis = await Models.HypothesisForms.findAll({});
    let hyMap = {};
    hypothesis.forEach((hy) => {
      hyMap[`${hy.id}`] = {
        name: hy.name,
      };
    });
    return hyMap;
  };
  const transformPA = (projectArch, hyMap) => {
    let _newPa = [];
    projectArch.forEach((pa) => {
      if (pa && pa.record && pa.record.hypothesisArray) {
        let ha = pa.record.hypothesisArray;
        let _newHa = [];
        ha.forEach((_ha) => {
          _newHa.push({ ..._ha, ...hyMap[_ha['hypothesisFormId']] });
        });
        pa.record.hypothesisArray = _newHa;
        _newPa.push(pa);
      }
    });
    return _newPa;
  };
  return {
    getProjectReview,
    getAllSubmissions,
    updateSubmission,
    deleteSubmission,
    getAllSubmissionsDownload,
    getSubmission,
    advanceSearchSubmissions,
    advanceSearchArchiveList,
  };
})();

module.exports = SubmissionsService;
